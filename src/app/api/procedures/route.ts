import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clinicId,
      patientId,
      doctorId,
      serviceId,
      toothNumber,
      surfaces,
      actualBilledPrice,
      discountAmount = 0,
      durationMinutes = 45,
      consumptions = [], // [{ materialId, actualQuantity, unit }]
      notes,
    } = body;

    if (!clinicId || !patientId || !doctorId || !serviceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch Service and Doctor to determine compensation and prices
      const service = await tx.serviceCatalog.findUniqueOrThrow({ where: { id: serviceId } });
      const doctor = await tx.doctor.findUniqueOrThrow({ where: { id: doctorId } });
      const clinic = await tx.clinic.findUniqueOrThrow({ where: { id: clinicId } });

      const billed = Number(actualBilledPrice) || service.standardPrice;
      const discount = Number(discountAmount) || 0;
      const netRevenue = billed - discount;

      // 2. Calculate direct material cost from consumed items and deduct stock using FEFO
      let totalMaterialCost = 0;
      const consumptionRecords: any[] = [];

      for (const item of consumptions) {
        const material = await tx.material.findUniqueOrThrow({ where: { id: item.materialId } });
        const qty = Number(item.actualQuantity) || 0;
        const unitCost = material.costPerBaseUnit;
        const cost = qty * unitCost;
        totalMaterialCost += cost;

        // Find active lot using FEFO (First Expired First Out)
        const activeLot = await tx.materialLot.findFirst({
          where: {
            clinicId,
            materialId: material.id,
            status: 'ACTIVE',
            currentStockBaseUnits: { gt: 0 },
          },
          orderBy: { expiryDate: 'asc' },
        });

        if (activeLot) {
          // Deduct from lot
          const newStock = Math.max(0, activeLot.currentStockBaseUnits - qty);
          await tx.materialLot.update({
            where: { id: activeLot.id },
            data: {
              currentStockBaseUnits: newStock,
              status: newStock === 0 ? 'DEPLETED' : 'ACTIVE',
            },
          });
        }

        consumptionRecords.push({
          materialId: material.id,
          lotId: activeLot?.id || null,
          actualQuantity: qty,
          unit: material.baseUnit,
          unitCost: unitCost,
          totalCost: cost,
          measuredMethod: 'DIRECTLY_MEASURED',
        });
      }

      // 3. Calculate doctor compensation based on doctor's model
      let doctorComp = 0;
      const rate = doctor.defaultCommissionRate / 100;
      if (doctor.compensationModel === 'PERCENT_NET_AFTER_LAB_MATERIALS') {
        doctorComp = Math.max(0, (netRevenue - totalMaterialCost) * rate);
      } else {
        // Standard PERCENT_COLLECTED or PERCENT_BILLED
        doctorComp = netRevenue * rate;
      }

      // Allocated chair overhead
      const totalAvailableHours = clinic.activeChairs * clinic.workingDaysPerMonth * clinic.dailyWorkingHours;
      const productiveHours = totalAvailableHours * clinic.occupancyRate;
      const chairMinuteCost = productiveHours > 0 ? (clinic.monthlyFixedExpenses / productiveHours) / 60 : 0;
      const allocatedOverhead = durationMinutes * chairMinuteCost;

      const contributionMargin = netRevenue - totalMaterialCost - doctorComp;
      const fullOperatingProfit = contributionMargin - allocatedOverhead;

      // 4. Create or attach to a Visit
      const visit = await tx.visit.create({
        data: {
          clinicId,
          patientId,
          doctorId,
          status: 'COMPLETED',
          totalAmount: billed,
          totalPaid: 0,
          balance: billed,
          chiefComplaint: `Procedure: ${service.name}`,
        },
      });

      // 5. Create Procedure Record
      const procedure = await tx.procedure.create({
        data: {
          clinicId,
          visitId: visit.id,
          patientId,
          doctorId,
          serviceId,
          toothNumber: toothNumber || null,
          surfaces: surfaces || null,
          status: 'COMPLETED',
          durationMinutes,
          standardPrice: service.standardPrice,
          actualBilledPrice: billed,
          discountAmount: discount,
          netEarnedRevenue: netRevenue,
          directMaterialCost: totalMaterialCost,
          labCost: 0,
          doctorCompensation: doctorComp,
          allocatedOverhead,
          contributionMargin,
          fullOperatingProfit,
          notes,
          finalizedAt: new Date(),
        },
      });

      // 6. Record Consumptions
      for (const c of consumptionRecords) {
        await tx.procedureConsumption.create({
          data: {
            ...c,
            procedureId: procedure.id,
          },
        });

        // Add Immutable Stock Movement
        await tx.stockMovement.create({
          data: {
            clinicId,
            materialId: c.materialId,
            lotId: c.lotId,
            movementType: 'PROCEDURE_CONSUMED',
            quantityBaseUnits: -c.actualQuantity,
            unit: c.unit,
            unitCost: c.unitCost,
            totalCost: c.totalCost,
            reason: `Finalized Procedure #${toothNumber || ''} (${service.name})`,
            procedureId: procedure.id,
          },
        });
      }

      // 7. Generate Patient Invoice
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const invoice = await tx.patientInvoice.create({
        data: {
          clinicId,
          visitId: visit.id,
          patientId,
          invoiceNumber,
          subtotal: billed,
          discountAmount: discount,
          totalAmount: netRevenue,
          paidAmount: 0,
          balance: netRevenue,
          status: 'UNPAID',
        },
      });

      // Update Patient current balance
      await tx.patient.update({
        where: { id: patientId },
        data: {
          currentBalance: { increment: netRevenue },
        },
      });

      // 8. Audit Log
      await tx.auditLog.create({
        data: {
          clinicId,
          action: 'FINALIZE_PROCEDURE',
          entityName: 'Procedure',
          entityId: procedure.id,
          newValue: {
            serviceCode: service.code,
            billed,
            netRevenue,
            totalMaterialCost,
            doctorComp,
          },
          reason: 'Clinical procedure completion and FEFO stock deduction',
        },
      });

      return { procedure, invoice };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error recording procedure:', err);
    return NextResponse.json({ error: err.message || 'Failed to record procedure' }, { status: 500 });
  }
}
