
import { Product, Order, Category, SiteSettings, Coupon, Review, UserAccount, Collection } from "./types";
import { deleteSharedValue, readAllSharedValues, readSharedValue, writeSharedValue as writeConvexValue } from "./convexStore";

const PRODUCT_STORAGE_KEY = "9teen_products";
const CATEGORIES_STORAGE_KEY = "9teen_categories";
const SITE_SETTINGS_KEY = "9teen_site_settings";
const COUPON_STORAGE_KEY = "9teen_coupons";
const REVIEW_STORAGE_KEY = "9teen_reviews";
const WISHLIST_STORAGE_KEY = "9teen_wishlist";
const USER_ACCOUNTS_KEY = "9teen_user_accounts";
const USER_SESSION_KEY = "9teen_user_session";
const ADMIN_STORAGE_KEY = "9teen_admin";
const LEGACY_ADMIN_STORAGE_KEY = "19teen_admin";
const LOOKBOOK_VERSION_KEY = "9teen_catalog_version";
const LOOKBOOK_VERSION = "lookbook-v1";
const LOOKBOOK_HQ_MIGRATION_KEY = "9teen_lookbook_hq_version";
const LOOKBOOK_HQ_MIGRATION_VERSION = "lookbook-hq-v1";
const COLLECTIONS_STORAGE_KEY = "9teen_collections";
export const DATA_CHANGED_EVENT = "9teen-data-changed";

const sharedCache: Record<string, unknown> = {};
let sharedHydrationPromise: Promise<void> | null = null;

function isBrowser(): boolean {
	return typeof window !== "undefined";
}

function notifyDataChanged() {
	if (!isBrowser()) return;
	window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
	void refreshFromSharedStorage(true);
}

function readCachedValue<T>(key: string, fallback: T): T {
	if (typeof sharedCache[key] !== "undefined") {
		return sharedCache[key] as T;
	}

	if (!isBrowser()) {
		return fallback;
	}

	return fallback;
}

function writeCachedValue(key: string, value: unknown) {
	sharedCache[key] = value;
}

function clearCachedValue(key: string) {
	delete sharedCache[key];
}

async function clearSharedValue(key: string) {
	if (!isBrowser()) return false;
	try {
		return await deleteSharedValue(key);
	} catch {
		return false;
	}
}

export async function hydrateSharedStorage(force = false) {
	return refreshFromSharedStorage(force);
}

async function refreshFromSharedStorage(force = false) {
	if (!isBrowser()) return;
	if (!force && sharedHydrationPromise) return sharedHydrationPromise;

	sharedHydrationPromise = (async () => {
		try {
			const store = await readAllSharedValues();
			if (store[LOOKBOOK_VERSION_KEY] !== LOOKBOOK_VERSION) {
				const lookbookSeed: Record<string, unknown> = {
					[PRODUCT_STORAGE_KEY]: defaultProducts,
					[CATEGORIES_STORAGE_KEY]: lookbookCategories,
					[SITE_SETTINGS_KEY]: defaultSiteSettings,
					[COUPON_STORAGE_KEY]: defaultCoupons,
					[REVIEW_STORAGE_KEY]: defaultReviews,
					[COLLECTIONS_STORAGE_KEY]: defaultCollections,
					[LOOKBOOK_VERSION_KEY]: LOOKBOOK_VERSION,
				};
				await Promise.all(Object.entries(lookbookSeed).map(async ([key, value]) => {
					await writeConvexValue(key, value);
					writeCachedValue(key, value);
				}));
				Object.assign(store, lookbookSeed);
			}
			if (!store[COLLECTIONS_STORAGE_KEY]) {
				await writeConvexValue(COLLECTIONS_STORAGE_KEY, defaultCollections);
				store[COLLECTIONS_STORAGE_KEY] = defaultCollections;
			}
			if (store[LOOKBOOK_HQ_MIGRATION_KEY] !== LOOKBOOK_HQ_MIGRATION_VERSION) {
				const products = Array.isArray(store[PRODUCT_STORAGE_KEY]) ? store[PRODUCT_STORAGE_KEY] as Product[] : defaultProducts;
				const categories = Array.isArray(store[CATEGORIES_STORAGE_KEY]) ? store[CATEGORIES_STORAGE_KEY] as Category[] : lookbookCategories;
				const settings = (store[SITE_SETTINGS_KEY] && typeof store[SITE_SETTINGS_KEY] === "object") ? store[SITE_SETTINGS_KEY] as Partial<SiteSettings> : defaultSiteSettings;
				const updatedProducts = products.map((product) => product.id === "p1" && product.image === "/lookbook/02-product-oversized-tee.png" ? { ...product, image: "/lookbook/02-product-oversized-tee-hq.png" } : product.id === "p2" && product.image === "/lookbook/03-product-chaos-hoodie.png" ? { ...product, image: "/lookbook/03-product-chaos-hoodie-hq.png" } : product);
				const updatedCategories = categories.map((category) => category.id === "tees" && category.image === "/lookbook/02-product-oversized-tee.png" ? { ...category, image: "/lookbook/02-product-oversized-tee-hq.png" } : category.id === "hoodies" && category.image === "/lookbook/03-product-chaos-hoodie.png" ? { ...category, image: "/lookbook/03-product-chaos-hoodie-hq.png" } : category);
				const updatedSettings = settings.heroImage === "/lookbook/01-hero-fashion-model.png" ? { ...settings, heroImage: "/lookbook/01-hero-fashion-model-hq.png" } : settings;
				await Promise.all([
					writeConvexValue(PRODUCT_STORAGE_KEY, updatedProducts),
					writeConvexValue(CATEGORIES_STORAGE_KEY, updatedCategories),
					writeConvexValue(SITE_SETTINGS_KEY, updatedSettings),
					writeConvexValue(LOOKBOOK_HQ_MIGRATION_KEY, LOOKBOOK_HQ_MIGRATION_VERSION),
				]);
				store[PRODUCT_STORAGE_KEY] = updatedProducts;
				store[CATEGORIES_STORAGE_KEY] = updatedCategories;
				store[SITE_SETTINGS_KEY] = updatedSettings;
				store[LOOKBOOK_HQ_MIGRATION_KEY] = LOOKBOOK_HQ_MIGRATION_VERSION;
			}
			Object.entries(store).forEach(([key, value]) => {
				if (value === null || value === undefined) {
					clearCachedValue(key);
				} else {
					writeCachedValue(key, value);
				}
			});
		} catch {}
	})().finally(() => {
		sharedHydrationPromise = null;
	});

	return sharedHydrationPromise;
}

async function writeSharedValue(key: string, value: unknown) {
	if (!isBrowser()) return false;

	try {
		const ok = await writeConvexValue(key, value);
		if (ok) {
			writeCachedValue(key, value);
			return true;
		}
		return false;
	} catch {
		// Keep the in-memory UI responsive, but never persist to a local fallback.
		return false;
	}
}

if (isBrowser()) {
	void refreshFromSharedStorage(true);
}

export const defaultCoupons: Coupon[] = [
	{ id: "c1", code: "TEEN10", discount: 10, active: true, description: "10% off sitewide" },
	{ id: "c2", code: "FREESHIP", discount: 0, active: true, description: "Free shipping on orders over NPR 2,999" },
];

export const defaultReviews: Review[] = [
	{ id: "r1", productId: "p1", name: "Asha", rating: 5, comment: "Great fit and quick delivery.", status: "approved", date: "2025-07-10" },
	{ id: "r2", productId: "p3", name: "Priya", rating: 4, comment: "Loved the dress color.", status: "pending", date: "2025-07-11" },
];

export const defaultCollections: Collection[] = [
	{ id: "summer", title: "Summer '24", subtitle: "Light. Comfortable. Effortless.", image: "/lookbook/10-collection-summer.png", ctaLabel: "Shop now", productIds: ["p1", "p4"], displayOrder: 1, published: true },
	{ id: "essentials", title: "Essentials", subtitle: "Timeless pieces, everyday.", image: "/lookbook/11-collection-essentials.png", ctaLabel: "Shop now", productIds: ["p2", "p5"], displayOrder: 2, published: true },
	{ id: "dark-edition", title: "Dark Edition", subtitle: "All black everything.", image: "/lookbook/12-collection-dark-edition.png", ctaLabel: "Shop now", productIds: ["p3", "p6"], displayOrder: 3, published: true },
];

export const lookbookCategories: Category[] = [
	{ id: "tees", name: "T-Shirts", emoji: "T", enabled: true, subcategories: ["Oversized", "Graphic", "Essentials"], image: "/lookbook/02-product-oversized-tee-hq.png" },
	{ id: "hoodies", name: "Hoodies", emoji: "H", enabled: true, subcategories: ["Pullover", "Zip-up", "Heavyweight"], image: "/lookbook/03-product-chaos-hoodie-hq.png" },
	{ id: "bottoms", name: "Bottoms", emoji: "B", enabled: true, subcategories: ["Cargo", "Relaxed", "Utility"], image: "/lookbook/04-product-utility-cargo-pants.png" },
	{ id: "women", name: "Women", emoji: "W", enabled: true, subcategories: ["Crop tops", "Core", "Fitted"], image: "/lookbook/05-product-ribbed-crop-top.png" },
	{ id: "accessories", name: "Accessories", emoji: "A", enabled: true, subcategories: ["Caps", "Bags", "Details"], image: "/lookbook/06-product-signature-cap.png" },
];

export const defaultProducts: Product[] = [
	{ id: "p1", name: "Oversized Graphic Tee", category: "tees", price: 1690, originalPrice: 1990, image: "/lookbook/02-product-oversized-tee-hq.png", description: "A heavyweight cotton tee with a relaxed, street-ready silhouette and back artwork.", sizes: ["S","M","L","XL"], variants:[{ name:"Color", values:["Cream","Black"] }], featured: true, badge: "New", inStock: true, newArrival: true, bestSeller: true, trending: true },
	{ id: "p2", name: "Chaos Hoodie", category: "hoodies", price: 2890, image: "/lookbook/03-product-chaos-hoodie-hq.png", description: "Brushed fleece hoodie with a relaxed fit and a bold everyday graphic.", sizes: ["S","M","L","XL"], variants:[{ name:"Color", values:["Oat","Charcoal"] }], featured: true, badge: "Best seller", inStock: true, newArrival: true, bestSeller: true, trending: false },
	{ id: "p3", name: "Utility Cargo Pants", category: "bottoms", price: 2790, image: "/lookbook/04-product-utility-cargo-pants.png", description: "Relaxed utility cargo pants designed for movement, layering, and everyday wear.", sizes: ["S","M","L","XL"], variants:[{ name:"Color", values:["Black","Olive"] }], featured: true, badge: "New", inStock: true, newArrival: true, bestSeller: false, trending: true },
	{ id: "p4", name: "Ribbed Crop Top", category: "women", price: 1380, image: "/lookbook/05-product-ribbed-crop-top.png", description: "A clean fitted rib top with stretch comfort and a minimal studio finish.", sizes: ["XS","S","M","L"], variants:[{ name:"Color", values:["Black","Stone"] }], featured: true, inStock: true, newArrival: true, bestSeller: false, trending: false },
	{ id: "p5", name: "Signature Cap", category: "accessories", price: 990, image: "/lookbook/06-product-signature-cap.png", description: "Structured six-panel cap finished with an embroidered 9TEEN signature.", sizes: ["One size"], variants:[{ name:"Color", values:["Black"] }], featured: false, inStock: true, newArrival: false, bestSeller: true, trending: false },
	{ id: "p6", name: "Shadow Graphic Tee", category: "tees", price: 1790, image: "/lookbook/07-product-shadow-graphic-tee.png", description: "Oversized graphic tee in soft cotton jersey with an easy dropped shoulder.", sizes: ["S","M","L","XL"], variants:[{ name:"Color", values:["White","Black"] }], featured: true, badge: "Limited", inStock: true, newArrival: false, bestSeller: false, trending: true },
];

export const defaultSiteSettings: SiteSettings = {
	siteName: "9TEEN",
	tagline: "Wear your confidence",
	heroTopLabel: "Premium streetwear",
	heroTitle: "Wear Your Story.",
	heroHighlight: "",
	heroSubtitle: "High quality. Bold designs. Made for those who lead, not follow.",
	heroImage: "/lookbook/01-hero-fashion-model-hq.png",
	heroButtonLabel: "Shop Collection",
	heroExploreButtonLabel: "New Arrivals",
	navLabelShop: "Shop",
	navLabelCategories: "Categories",
	navLabelCollections: "Collections",
	navLabelTrackOrder: "Track Order",
	navLabelAbout: "About",
	navLabelLogin: "Login",
	promoText: "FREE SHIPPING ON ORDERS OVER NPR 2,999",
	searchPlaceholder: "Search products, categories...",
	sectionShopByCategoryLabel: "Shop by category",
	sectionShopByCategoryTitle: "Shop by Category",
	sectionProductsEnabled: true,
	sectionProductsLabel: "New products",
	sectionProductsTitle: "Latest arrivals",
	sectionNewArrivalsEnabled: true,
	sectionNewArrivalsLabel: "New arrivals",
	sectionNewArrivalsTitle: "Fresh Picks",
	sectionBestSellersEnabled: true,
	sectionBestSellersLabel: "Best sellers",
	sectionBestSellersTitle: "Top Picks",
	sectionTrendingEnabled: true,
	sectionTrendingLabel: "Trending",
	sectionTrendingTitle: "Trending",
	sectionFeaturedEnabled: true,
	sectionFeaturedLabel: "Featured",
	sectionFeaturedTitle: "Featured Collection",
	sectionSaleEnabled: true,
	sectionSaleLabel: "Sale",
	sectionSaleTitle: "Sale Finds",
	sectionSpecialOfferEnabled: true,
	sectionSpecialOfferLabel: "Special offer",
	sectionSpecialOfferTitle: "Up to 50% off on selected items",
	sectionSpecialOfferButtonLabel: "Shop Now",
	sectionOrder: ["shopByCategory", "products", "newArrivals", "bestSellers", "trending", "featured", "sale", "specialOffer"],
	esewaEnabled: true,
	esewaLabel: "eSewa",
	esewaTitle: "Pay with eSewa",
	esewaDescription: "Scan this QR in your eSewa app to pay faster.",
	esewaButtonLabel: "Pay with eSewa",
	esewaQrImage: "",
	whatsappNumber: "9779812345678",
	whatsappMessage: "Hi, I just placed an order from 9TEEN. Order ID: {orderId}, Total: NPR {total}. Please confirm the details.",
	notificationEmail: "info@9teen.com",
	emailSubject: "Your 9TEEN Order {orderId}",
	emailBody: "Hello {name},\n\nThanks for shopping with {siteName}. Your order #{orderId} is confirmed. Total: NPR {total}.\n\nDelivery address:\n{address}, {city}\n\nWe'll notify you once your items ship.\n\nCheers,\n{siteName} Team",
	adminUsername: "",
	adminPassword: "",
	footerContactEmail: "info@9teen.com",
	footerContactPhone: "+977 9800000000",
	footerContactLocation: "Kathmandu, Nepal",
	footerDeveloperText: "Website developed by 9TEEN developer.",
	footerDeveloperLink: "https://www.instagram.com/9teen.official",
	footerDeveloperLinkLabel: "Contact Developer",
	footerMiddleText: "Need help with your order or payment? Message us on WhatsApp in the middle section below.",
	footerWhatsAppButtonLabel: "WhatsApp Support",
	footerUpdatedDate: "24/07/2026 09:03",
	designImages: ["/lookbook/10-collection-summer.png", "/lookbook/11-collection-essentials.png", "/lookbook/12-collection-dark-edition.png"],
};

export function getCategories(): Category[] {
	const saved = readCachedValue<Category[] | null>(CATEGORIES_STORAGE_KEY, null);
	if (!saved || saved.length === 0) {
		return lookbookCategories.map((item) => ({ ...item }));
	}
	return saved.map((c) => {
		const fallback = lookbookCategories.find((d) => d.id === c.id);
		const isKnownBrokenUpload = typeof c.image === "string" && c.image.includes("e39b2c09-b51e-4b32-8758-b59f13b26c60");
		const image = !isKnownBrokenUpload && typeof c.image === "string" && (c.image.startsWith("/lookbook/") || c.image.includes("/api/storage/")) ? c.image : fallback?.image;
		return { ...fallback, ...c, ...(image ? { image } : {}) } as Category;
	});
}

export function saveCategories(categoryList: Category[]) {
	writeCachedValue(CATEGORIES_STORAGE_KEY, categoryList);
	void writeSharedValue(CATEGORIES_STORAGE_KEY, categoryList);
	notifyDataChanged();
}

export function getCollections(): Collection[] {
	const saved = readCachedValue<Collection[] | null>(COLLECTIONS_STORAGE_KEY, null);
	return (saved?.length ? saved : defaultCollections).slice().sort((a, b) => a.displayOrder - b.displayOrder);
}

export function saveCollections(collectionList: Collection[]) {
	writeCachedValue(COLLECTIONS_STORAGE_KEY, collectionList);
	void writeSharedValue(COLLECTIONS_STORAGE_KEY, collectionList);
	notifyDataChanged();
}

export function getProducts(): Product[] {
	const saved = readCachedValue<Product[] | null>(PRODUCT_STORAGE_KEY, null);
	if (!saved || saved.length === 0) {
		return defaultProducts.map((item) => ({ ...item }));
	}
	return saved.map((p) => ({ ...defaultProducts.find((d) => d.id === p.id) ?? {}, ...p }));
}

export function saveProducts(products: Product[]) {
	writeCachedValue(PRODUCT_STORAGE_KEY, products);
	void writeSharedValue(PRODUCT_STORAGE_KEY, products);
	notifyDataChanged();
}

export function getSiteSettings(): SiteSettings {
	const saved = readCachedValue<Partial<SiteSettings> | null>(SITE_SETTINGS_KEY, null);
	return saved ? { ...defaultSiteSettings, ...saved } : defaultSiteSettings;
}

export function saveSiteSettings(settings: SiteSettings) {
	writeCachedValue(SITE_SETTINGS_KEY, settings);
	void writeSharedValue(SITE_SETTINGS_KEY, settings);
	notifyDataChanged();
}

export function getUserAccounts(): UserAccount[] {
	return readCachedValue<UserAccount[]>(USER_ACCOUNTS_KEY, []);
}

export function saveUserAccounts(accounts: UserAccount[]) {
	writeCachedValue(USER_ACCOUNTS_KEY, accounts);
	void writeSharedValue(USER_ACCOUNTS_KEY, accounts);
	notifyDataChanged();
}

// Simple hash function for demo (NOT for production - use bcrypt in real app)
function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString(16);
}

function validatePassword(password: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (password.length < 8) errors.push("Password must be at least 8 characters");
	if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter");
	if (!/[0-9]/.test(password)) errors.push("Password must contain number");
	if (!/[!@#$%^&*]/.test(password)) errors.push("Password must contain special character");
	return { valid: errors.length === 0, errors };
}

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) && email.length <= 254;
}

export function registerUser(input: { name: string; email: string; phone: string; password: string; address: string; city: string }) {
	try {
		if (!input.name || input.name.length < 2 || input.name.length > 100) return null;
		if (!validateEmail(input.email)) return null;
		if (!input.phone || input.phone.length < 10 || input.phone.length > 20) return null;
		if (input.address.length > 500) return null;
		if (input.city.length > 100) return null;

		const passwordValidation = validatePassword(input.password);
		if (!passwordValidation.valid) return null;

		const accounts = getUserAccounts();
		const emailExists = accounts.some((account) => account.email.toLowerCase() === input.email.toLowerCase());
		if (emailExists) return null;

		const newAccount: UserAccount = {
			id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
			name: input.name.trim(),
			email: input.email.trim().toLowerCase(),
			phone: input.phone.trim(),
			password: simpleHash(input.password),
			address: input.address.trim(),
			city: input.city.trim(),
			createdAt: new Date().toISOString(),
		};

		accounts.push(newAccount);
		saveUserAccounts(accounts);
		writeCachedValue(USER_SESSION_KEY, newAccount);
		void writeSharedValue(USER_SESSION_KEY, newAccount);
		notifyDataChanged();
		return newAccount;
	} catch {
		return null;
	}
}

export function loginUser(email: string, password: string) {
	try {
		if (!validateEmail(email) || !password || password.length < 1) return null;

		const accounts = getUserAccounts();
		const account = accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === simpleHash(password));
		if (!account) return null;

		const sessionData = { ...account, sessionCreated: Date.now() };
		writeCachedValue(USER_SESSION_KEY, sessionData);
		void writeSharedValue(USER_SESSION_KEY, sessionData);
		notifyDataChanged();
		return account;
	} catch {
		return null;
	}
}

export function getCurrentUser(): UserAccount | null {
	return readCachedValue<UserAccount | null>(USER_SESSION_KEY, null);
}

export function isUserLoggedIn() {
	return Boolean(getCurrentUser());
}

export function logoutUser() {
	clearCachedValue(USER_SESSION_KEY);
	void writeSharedValue(USER_SESSION_KEY, null);
	notifyDataChanged();
}

export function saveAllAdminData() {
	saveProducts(getProducts());
	saveCategories(getCategories());
	saveSiteSettings(getSiteSettings());
	saveCoupons(getCoupons());
	saveReviews(getReviews());
	saveOrders(getOrders());
	saveUserAccounts(getUserAccounts());
	saveWishlist(getWishlist());
	const cart = readCachedValue<unknown[]>("9teen_cart", []);
	writeCachedValue("9teen_cart", cart);
	void writeSharedValue("9teen_cart", cart);
	const lastOrder = readCachedValue<Order | null>("9teen_last_order", null);
	writeCachedValue("9teen_last_order", lastOrder);
	void writeSharedValue("9teen_last_order", lastOrder);
	const session = getCurrentUser();
	if (session) {
		writeCachedValue(USER_SESSION_KEY, session);
		void writeSharedValue(USER_SESSION_KEY, session);
	}
	notifyDataChanged();
}

export function getLastOrder(): Order | null {
	return readCachedValue<Order | null>("9teen_last_order", null);
}

export function saveLastOrder(order: Order | null) {
	writeCachedValue("9teen_last_order", order);
	void writeSharedValue("9teen_last_order", order);
}

export async function getAdminLockoutState(): Promise<{ timestamp: number; attempts: number } | null> {
	if (!isBrowser()) return null;
	try {
		const stored = await readSharedValue(ADMIN_STORAGE_KEY);
		return stored && typeof stored === "object" && "timestamp" in stored && "attempts" in stored
			? (stored as { timestamp: number; attempts: number })
			: null;
	} catch {
		return null;
	}
}

export async function saveAdminLockoutState(state: { timestamp: number; attempts: number } | null) {
	if (!isBrowser()) return;
	writeCachedValue(ADMIN_STORAGE_KEY, state);
	await writeSharedValue(ADMIN_STORAGE_KEY, state);
	notifyDataChanged();
}

export async function clearAdminLockoutState() {
	if (!isBrowser()) return;
	clearCachedValue(ADMIN_STORAGE_KEY);
	await clearSharedValue(ADMIN_STORAGE_KEY);
	notifyDataChanged();
}

export function resetProducts() {
	clearCachedValue(PRODUCT_STORAGE_KEY);
	void writeSharedValue(PRODUCT_STORAGE_KEY, null);
	notifyDataChanged();
}

export function resetCategories() {
	clearCachedValue(CATEGORIES_STORAGE_KEY);
	void clearSharedValue(CATEGORIES_STORAGE_KEY);
	notifyDataChanged();
}

export function resetSiteSettings() {
	clearCachedValue(SITE_SETTINGS_KEY);
	void clearSharedValue(SITE_SETTINGS_KEY);
	notifyDataChanged();
}

export function resetOrders() {
	clearCachedValue("9teen_orders");
	clearCachedValue("9teen_last_order");
	void clearSharedValue("9teen_orders");
	void clearSharedValue("9teen_last_order");
	notifyDataChanged();
}

export function resetAllData() {
	const keysToDelete = [
		PRODUCT_STORAGE_KEY,
		CATEGORIES_STORAGE_KEY,
		SITE_SETTINGS_KEY,
		"9teen_orders",
		"9teen_last_order",
		COUPON_STORAGE_KEY,
		REVIEW_STORAGE_KEY,
		WISHLIST_STORAGE_KEY,
		USER_ACCOUNTS_KEY,
		USER_SESSION_KEY,
		"9teen_cart",
	];
	keysToDelete.forEach((key) => {
		clearCachedValue(key);
		void clearSharedValue(key);
	});
	notifyDataChanged();
}

export function getCoupons(): Coupon[] {
	return readCachedValue<Coupon[]>(COUPON_STORAGE_KEY, defaultCoupons);
}

export function saveCoupons(coupons: Coupon[]) {
	writeCachedValue(COUPON_STORAGE_KEY, coupons);
	void writeSharedValue(COUPON_STORAGE_KEY, coupons);
	notifyDataChanged();
}

export function getReviews(): Review[] {
	return readCachedValue<Review[]>(REVIEW_STORAGE_KEY, defaultReviews);
}

export function saveReviews(reviews: Review[]) {
	writeCachedValue(REVIEW_STORAGE_KEY, reviews);
	void writeSharedValue(REVIEW_STORAGE_KEY, reviews);
	notifyDataChanged();
}

export function getWishlist(): string[] {
	return readCachedValue<string[]>(WISHLIST_STORAGE_KEY, []);
}

export function saveWishlist(ids: string[]) {
	writeCachedValue(WISHLIST_STORAGE_KEY, ids);
	void writeSharedValue(WISHLIST_STORAGE_KEY, ids);
	notifyDataChanged();
}

export function toggleWishlist(productId: string) {
	const current = getWishlist();
	const next = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId];
	saveWishlist(next);
	return next;
}

export function addReview(review: Review) {
	const reviews = getReviews();
	reviews.unshift(review);
	saveReviews(reviews);
}

export function saveOrders(orders: Order[]) {
	writeCachedValue("9teen_orders", orders);
	void writeSharedValue("9teen_orders", orders);
	notifyDataChanged();
}

export function saveOrder(order: Order) {
	const arr = getOrders();
	arr.unshift(order);
	saveOrders(arr);
	saveLastOrder(order);
	notifyDataChanged();
}

export function formatWhatsappMessage(settings: SiteSettings, order: Order) {
	return settings.whatsappMessage
		.replace(/{orderId}/g, order.id)
		.replace(/{total}/g, order.total.toLocaleString())
		.replace(/{siteName}/g, settings.siteName)
		.replace(/{name}/g, order.customer.name)
		.replace(/{address}/g, order.customer.address)
		.replace(/{city}/g, order.customer.city);
}

export function formatEmailSubject(settings: SiteSettings, order: Order) {
	return settings.emailSubject
		.replace(/{orderId}/g, order.id)
		.replace(/{total}/g, order.total.toLocaleString())
		.replace(/{siteName}/g, settings.siteName);
}

export function formatEmailBody(settings: SiteSettings, order: Order) {
	return settings.emailBody
		.replace(/{orderId}/g, order.id)
		.replace(/{total}/g, order.total.toLocaleString())
		.replace(/{siteName}/g, settings.siteName)
		.replace(/{name}/g, order.customer.name)
		.replace(/{address}/g, order.customer.address)
		.replace(/{city}/g, order.customer.city)
		.replace(/{paymentMethod}/g, order.paymentMethod)
		.replace(/{status}/g, order.status);
}

export function buildMailtoLink(to: string, subject: string, body: string) {
	return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildWhatsappLink(number: string, message: string) {
	const cleaned = number.replace(/[^0-9]/g, "");
	return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function getOrders(): Order[] {
	return readCachedValue<Order[]>("9teen_orders", []);
}

export function adminLogin(username: string, pw: string) {
	try {
		if (!username || !pw || username.length < 1 || pw.length < 1) return false;

		const settings = getSiteSettings();
		if (!settings.adminUsername || !settings.adminPassword) {
			console.warn("Admin credentials not configured");
			return false;
		}

		if (username === settings.adminUsername && pw === settings.adminPassword) {
			const session = { authenticated: true, timestamp: Date.now() };
			writeCachedValue(ADMIN_STORAGE_KEY, session);
			void writeSharedValue(ADMIN_STORAGE_KEY, session);
			clearCachedValue(LEGACY_ADMIN_STORAGE_KEY);
			return true;
		}
	} catch {
		console.warn("Admin login error");
	}
	return false;
}

export function isAdminLoggedIn() {
	const token = readCachedValue<any>(ADMIN_STORAGE_KEY, null);
	if (!token) return false;
	try {
		const parsed = typeof token === "string" ? JSON.parse(token) : token;
		const sessionTimeout = 24 * 60 * 60 * 1000;
		const isExpired = Date.now() - parsed.timestamp > sessionTimeout;
		if (isExpired) {
			clearCachedValue(ADMIN_STORAGE_KEY);
			void clearSharedValue(ADMIN_STORAGE_KEY);
			return false;
		}
		return parsed.authenticated === true;
	} catch {
		return false;
	}
}

export function adminLogout() {
	clearCachedValue(ADMIN_STORAGE_KEY);
	clearCachedValue(LEGACY_ADMIN_STORAGE_KEY);
	void clearSharedValue(ADMIN_STORAGE_KEY);
	void clearSharedValue(LEGACY_ADMIN_STORAGE_KEY);
	notifyDataChanged();
}

// keep types exported from types.ts for consumers
