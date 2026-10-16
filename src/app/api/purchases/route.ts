import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clinicId,
      supplierId,
      materialId,
      lotNumber,
      expiryDate,
      packagesCount,
      packagePrice,
      isPaidNow = false,
      financialAccountId,
      notes,
    } = body;

    if (!clinicId || !supplierId || !materialId || !packagesCount || !packagePrice) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const material = await tx.material.findUniqueOrThrow({ where: { id: materialId } });
      const supplier = await tx.supplier.findUniqueOrThrow({ where: { id: supplierId } });

      const totalPackages = Number(packagesCount);
      const pkgPrice = Number(packagePrice);
      const totalCost = totalPackages * pkgPrice;
      const totalBaseUnits = totalPackages * material.conversionFactor;
      const costPerBase = totalCost / totalBaseUnits;

      const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
      const expDate = expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      // 1. Create Purchase Order
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          clinicId,
          supplierId,
          orderNumber,
          status: 'RECEIVED',
          receivedDate: new Date(),
          subtotal: totalCost,
          totalAmount: totalCost,
          paidAmount: isPaidNow ? totalCost : 0,
          paymentStatus: isPaidNow ? 'PAID' : 'UNPAID',
          notes,
          items: {
            create: {
              materialId,
              quantityOrdered: totalPackages,
              quantityReceived: totalPackages,
              packageUnit: material.packageUnit,
              packagePrice: pkgPrice,
              subtotal: totalCost,
              lotNumber: lotNumber || `LOT-${Date.now().toString().slice(-4)}`,
              expiryDate: expDate,
            },
          },
        },
      });

      // 2. Create Material Lot
      const lot = await tx.materialLot.create({
        data: {
          clinicId,
          materialId,
          supplierId,
          lotNumber: lotNumber || `LOT-${Date.now().toString().slice(-4)}`,
          expiryDate: expDate,
          purchasePrice: totalCost,
          purchaseQuantityUnits: totalPackages,
          currentStockBaseUnits: totalBaseUnits,
          unitCostBaseUnit: costPerBase,
          status: 'ACTIVE',
          invoiceReference: orderNumber,
        },
      });

      // 3. Create Stock Movement (Purchase Receipt)
      await tx.stockMovement.create({
        data: {
          clinicId,
          materialId,
          lotId: lot.id,
          movementType: 'PURCHASE_RECEIPT',
          quantityBaseUnits: totalBaseUnits,
          unit: material.baseUnit,
          unitCost: costPerBase,
          totalCost,
          reason: `Goods Received PO #${orderNumber} (${supplier.name})`,
          purchaseOrderId: purchaseOrder.id,
        },
      });

      // 4. Update Accounts Payable or Deduct Cash
      if (isPaidNow && financialAccountId) {
        // Record payment to supplier
        await tx.supplierPayment.create({
          data: {
            clinicId,
            supplierId,
            purchaseOrderId: purchaseOrder.id,
            financialAccountId,
            amount: totalCost,
            paymentMethod: 'CASH',
            notes: `Paid immediately upon reception`,
          },
        });

        // Decrement Cash Account
        await tx.financialAccount.update({
          where: { id: financialAccountId },
          data: {
            currentBalance: { decrement: totalCost },
          },
        });
      } else {
        // Unpaid: Increment Supplier Accounts Payable
        await tx.supplier.update({
          where: { id: supplierId },
          data: {
            currentBalance: { increment: totalCost },
          },
        });
      }

      // 5. Update Material cost per base unit if latest
      await tx.material.update({
        where: { id: materialId },
        data: {
          costPerBaseUnit: costPerBase,
        },
      });

      return { purchaseOrder, lot };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error recording purchase:', err);
    return NextResponse.json({ error: err.message || 'Failed to record purchase' }, { status: 500 });
  }
}
