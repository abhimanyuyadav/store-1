import { writeSharedValue } from "@/lib/convexStore";

type PersistResult = { success: boolean; inserted: number; error?: string };

export async function postProducts(products: any[]): Promise<PersistResult> {
  await writeSharedValue("9teen_products", products);
  return { success: true, inserted: products.length };
}

export async function postOrders(orders: any[]): Promise<PersistResult> {
  await writeSharedValue("9teen_orders", orders);
  return { success: true, inserted: orders.length };
}

export async function postUsers(users: any[]): Promise<PersistResult> {
  await writeSharedValue("9teen_user_accounts", users);
  return { success: true, inserted: users.length };
}

export async function migrateAll(payload: { products?: any[]; orders?: any[]; users?: any[] }) {
  const results: any = {};
  try {
    results.products = payload.products ? await postProducts(payload.products) : { skipped: true };
  } catch (e) { results.products = { error: (e as Error).message }; }
  try {
    results.orders = payload.orders ? await postOrders(payload.orders) : { skipped: true };
  } catch (e) { results.orders = { error: (e as Error).message }; }
  try {
    results.users = payload.users ? await postUsers(payload.users) : { skipped: true };
  } catch (e) { results.users = { error: (e as Error).message }; }
  return results;
}
