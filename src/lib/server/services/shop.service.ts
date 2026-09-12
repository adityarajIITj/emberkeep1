import { prisma } from "../prisma";

export class ShopService {
  /**
   * Retrieves the cosmetic Merchant catalog annotated with ownership and equip status.
   */
  static async getShopCatalog(userId: string) {
    const items = await prisma.shopItem.findMany({
      where: { is_active: true },
      orderBy: { price_gold: "asc" },
    });

    const userInventory = await prisma.inventoryItem.findMany({
      where: { user_id: userId },
    });

    const inventoryMap = new Map(
      userInventory.map((inv) => [inv.shop_item_id, inv])
    );

    return items.map((item) => {
      const ownedRecord = inventoryMap.get(item.id);
      return {
        ...item,
        isOwned: Boolean(ownedRecord),
        isEquipped: Boolean(ownedRecord?.equipped),
        inventoryId: ownedRecord?.id || null,
      };
    });
  }

  /**
   * Purchases a cosmetic item transactionally.
   * Enforces:
   * 1. Balance check (no negative gold)
   * 2. Duplicate ownership guard (409)
   * 3. Immutable GoldLedger deduction record
   * 4. InventoryItem creation
   */
  static async purchaseItem(userId: string, shopItemId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch item
      const item = await tx.shopItem.findFirst({
        where: { id: shopItemId, is_active: true },
      });

      if (!item) {
        const err = new Error("Shop item not found or currently unavailable");
        (err as unknown as { code: string; status: number }).code = "NOT_FOUND";
        (err as unknown as { code: string; status: number }).status = 404;
        throw err;
      }

      // 2. Check for duplicate ownership (§6 unique constraint)
      const existingInventory = await tx.inventoryItem.findUnique({
        where: {
          user_id_shop_item_id: {
            user_id: userId,
            shop_item_id: shopItemId,
          },
        },
      });

      if (existingInventory) {
        const err = new Error("You already possess this cosmetic artifact");
        (err as unknown as { code: string; status: number }).code = "ALREADY_OWNED";
        (err as unknown as { code: string; status: number }).status = 409;
        throw err;
      }

      // 3. Verify character balance
      const character = await tx.character.findUnique({
        where: { user_id: userId },
      });

      if (!character || character.gold < item.price_gold) {
        const err = new Error(
          `Insufficient Gold. Required: ${item.price_gold}g, available: ${character?.gold || 0}g`
        );
        (err as unknown as { code: string; status: number }).code = "INSUFFICIENT_GOLD";
        (err as unknown as { code: string; status: number }).status = 400;
        throw err;
      }

      // 4. Deduct gold
      const newGoldBalance = character.gold - item.price_gold;
      await tx.character.update({
        where: { user_id: userId },
        data: { gold: newGoldBalance },
      });

      // 5. Append-only ledger record
      await tx.goldLedger.create({
        data: {
          user_id: userId,
          amount: -item.price_gold,
          source: "SHOP_PURCHASE",
          reference_id: item.id,
        },
      });

      // 6. Create inventory record
      const inventoryItem = await tx.inventoryItem.create({
        data: {
          user_id: userId,
          shop_item_id: item.id,
          equipped: false,
        },
        include: {
          shop_item: true,
        },
      });

      return {
        inventoryItem,
        newGoldBalance,
      };
    });
  }

  /**
   * Equips or unequips a cosmetic item in The Armory.
   * Exclusive equipping per cosmetic slot (Theme, Title, Avatar Frame).
   */
  static async equipItem(
    userId: string,
    inventoryItemId: string,
    shouldEquip: boolean
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch inventory item with ownership check
      const item = await tx.inventoryItem.findFirst({
        where: { id: inventoryItemId, user_id: userId },
        include: { shop_item: true },
      });

      if (!item) {
        const err = new Error("Cosmetic item not found in your armory");
        (err as unknown as { code: string; status: number }).code = "NOT_FOUND";
        (err as unknown as { code: string; status: number }).status = 404;
        throw err;
      }

      const itemType = item.shop_item.type;

      if (shouldEquip) {
        // Unequip any other item of the same slot for this user
        const sameTypeItems = await tx.inventoryItem.findMany({
          where: {
            user_id: userId,
            shop_item: { type: itemType },
            equipped: true,
          },
        });

        for (const prev of sameTypeItems) {
          await tx.inventoryItem.update({
            where: { id: prev.id },
            data: { equipped: false },
          });
        }

        // Equip this item
        await tx.inventoryItem.update({
          where: { id: inventoryItemId },
          data: { equipped: true },
        });

        // Update Character pointer
        const characterUpdate: Record<string, string | null> = {};
        if (itemType === "THEME") characterUpdate.equipped_theme_id = item.id;
        if (itemType === "TITLE") characterUpdate.equipped_title_id = item.id;
        if (itemType === "AVATAR_FRAME") characterUpdate.equipped_frame_id = item.id;

        await tx.character.update({
          where: { user_id: userId },
          data: characterUpdate,
        });
      } else {
        // Unequip
        await tx.inventoryItem.update({
          where: { id: inventoryItemId },
          data: { equipped: false },
        });

        const characterUpdate: Record<string, string | null> = {};
        if (itemType === "THEME") characterUpdate.equipped_theme_id = null;
        if (itemType === "TITLE") characterUpdate.equipped_title_id = null;
        if (itemType === "AVATAR_FRAME") characterUpdate.equipped_frame_id = null;

        await tx.character.update({
          where: { user_id: userId },
          data: characterUpdate,
        });
      }

      return {
        success: true,
        inventoryItemId,
        equipped: shouldEquip,
        itemType,
      };
    });
  }

  /**
   * Retrieves player's complete armory collection.
   */
  static async getUserInventory(userId: string) {
    return await prisma.inventoryItem.findMany({
      where: { user_id: userId },
      include: {
        shop_item: true,
      },
      orderBy: {
        acquired_at: "desc",
      },
    });
  }
}
