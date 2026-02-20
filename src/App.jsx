import { useMemo, useState } from "react";

const tabs = [
  { id: "offerings", label: "Offerings" },
  { id: "products", label: "Products" },
  { id: "pricing", label: "Pricing" },
  { id: "entitlements", label: "Entitlements" },
  { id: "virtual-currencies", label: "Virtual currencies", beta: true }
];

const offeringsRows = [
  ["default", "our standard set of packages", "2 packages", "May 19, 2020", "..."],
  ["experiments2", "59.99 and 12.99", "5 packages", "Dec 14, 2020", "..."],
  ["lowcostcountries", "Currently India and Mexico", "3 packages", "Jul 27, 2022", "..."],
  ["higher-cost", "annual 69.99, monthly 12.99, quarterly 25.99", "4 packages", "Dec 16, 2022", "..."],
  ["lowercost-us-4899", "AB test for lowercost us", "2 packages", "Feb 13, 2023", "..."]
];

const productsRows = [
  ["com.dipsea.android.annual", "Jul 22, 2019"],
  ["com.dipsea.android.monthly", "Jul 22, 2019"],
  ["com.dipsea.android.annual.5999", "Apr 29, 2021"],
  ["com.dipsea.android.monthly.1299", "Apr 29, 2021"],
  ["com.dipsea.android.annual.5999.30.day.trial", "Jun 15, 2021"]
];

const productsByStore = [
  {
    title: "Dipsea (Play Store)",
    rows: [
      { product: "com.dipsea.android.annual", created: "Jul 22, 2019", pricingTemplate: "Default subscriptions" },
      { product: "com.dipsea.android.monthly", created: "Jul 22, 2019", pricingTemplate: "Default subscriptions" },
      { product: "com.dipsea.android.annual.5999", created: "Apr 29, 2021", pricingTemplate: "Holiday promo" },
      { product: "com.dipsea.android.monthly.1299", created: "Apr 29, 2021", pricingTemplate: "–" },
      { product: "com.dipsea.android.annual.5999.30.day.trial", created: "Jun 15, 2021", pricingTemplate: "Regional pricing" }
    ]
  },
  {
    title: "Dipsea (App Store)",
    rows: [
      { product: "com.dipsea.ios.annual", created: "Sep 08, 2019", pricingTemplate: "Default subscriptions" },
      { product: "com.dipsea.ios.monthly", created: "Sep 08, 2019", pricingTemplate: "Default subscriptions" },
      { product: "com.dipsea.ios.annual.5999", created: "May 01, 2021", pricingTemplate: "Holiday promo" },
      { product: "com.dipsea.ios.monthly.1299", created: "May 01, 2021", pricingTemplate: "–" }
    ]
  },
  {
    title: "Dipsea (Stripe)",
    rows: [
      { product: "dipsea_web_monthly", created: "Jan 17, 2022", pricingTemplate: "Default subscriptions" },
      { product: "dipsea_web_annual", created: "Jan 17, 2022", pricingTemplate: "Holiday promo" },
      { product: "dipsea_web_gift", created: "Apr 22, 2023", pricingTemplate: "–" }
    ]
  },
  {
    title: "Dipsea (RC Billing)",
    rows: [
      { product: "dipsea_rc_monthly", created: "Jul 03, 2024", pricingTemplate: "Regional pricing" },
      { product: "dipsea_rc_annual", created: "Jul 03, 2024", pricingTemplate: "–" }
    ]
  }
];

const entitlementsRows = [
  ["subscriptions", "Subscriptions", "48 products", "Sep 04, 2018"],
  ["gifts", "Subscription gifts redeemed", "1 product", "Oct 09, 2020"]
];

const sourceOptions = ["Reference price", "Existing product", "CSV upload"];

const convertUsingOptions = [
  "Currency exchange rates",
  "Purchasing power parity (world bank)",
  "Big Mac index",
  "Spotify index",
  "Netflix index",
  "Apple price tiers"
];

const currencyOptions = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"];

const modifierOptions = ["Percentage discount", "Absolute discount", "Price override", "Nice price (.99)"];

const nicePriceMethods = ["Charm pricing (.99)", "Round pricing (.00)"];

const countryOptions = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "India", "Mexico", "Japan"];

const previewTemplateRows = [
  { currency: "USD", country: "United States" },
  { currency: "USD", country: "Albania" },
  { currency: "EUR", country: "Germany" },
  { currency: "EUR", country: "France" },
  { currency: "EUR", country: "Spain" },
  { currency: "EUR", country: "Italy" },
  { currency: "GBP", country: "" },
  { currency: "AUD", country: "" },
  { currency: "JPY", country: "" },
  { currency: "INR", country: "" }
];

const fxRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  JPY: 149,
  INR: 83
};

const conversionFactors = {
  "Currency exchange rates": 1,
  "Purchasing power parity (world bank)": 0.94,
  "Big Mac index": 1.08,
  "Spotify index": 1.03,
  "Netflix index": 1.11,
  "Apple price tiers": 1.16
};

const getPreviewRowKey = (currency, country) => `${currency}__${country || "blank"}`;
const getPreviewRowLabel = (currency, country) => `${currency}, ${country || "(blank)"}`;

const parseAmount = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCurrencyDecimals = (currency) => (currency === "JPY" ? 0 : 2);

const normalizeAmountForCurrency = (currency, amount) => {
  const decimals = getCurrencyDecimals(currency);
  return Number(amount.toFixed(decimals));
};

const formatPrice = (currency, amount) => {
  const decimals = getCurrencyDecimals(currency);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Math.max(0, amount));
};

const productSeed = (productId) => {
  let sum = 0;
  for (let index = 0; index < productId.length; index += 1) {
    sum += productId.charCodeAt(index);
  }
  return 5 + (sum % 600) / 100;
};

const formatConversionAsOf = (timestamp) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));

const makeSeededPreviewRows = (baseUsd) =>
  previewTemplateRows.map((row, index) => {
    const rate = fxRates[row.currency] || 1;
    const amount = normalizeAmountForCurrency(row.currency, (baseUsd + index * 0.12) * rate);
    return {
      ...row,
      key: getPreviewRowKey(row.currency, row.country),
      label: getPreviewRowLabel(row.currency, row.country),
      amount,
      formattedPrice: formatPrice(row.currency, amount)
    };
  });

const initialTemplates = [
  {
    id: "tpl-default-subscriptions",
    name: "Default subscriptions",
    type: "Subscription",
    duration: "Monthly",
    versions: [
      {
        number: 1,
        date: "May 19, 2024",
        products: ["com.dipsea.android.monthly"],
        sourceSummary: "Reference price: USD 8.99 (Currency exchange rates)",
        modifierSummaries: [],
        storeCompatibilitySummaries: [],
        previewRows: makeSeededPreviewRows(8.99)
      },
      {
        number: 2,
        date: "Aug 02, 2024",
        products: ["com.dipsea.android.monthly", "com.dipsea.ios.monthly"],
        sourceSummary: "Reference price: USD 9.49 (Currency exchange rates)",
        modifierSummaries: ["Nice price: Charm pricing (.99)"],
        storeCompatibilitySummaries: [],
        previewRows: makeSeededPreviewRows(9.49)
      },
      {
        number: 3,
        date: "Nov 18, 2025",
        products: ["com.dipsea.android.monthly", "com.dipsea.ios.monthly", "com.dipsea.web.monthly"],
        sourceSummary: "Reference price: USD 9.99 (Currency exchange rates)",
        modifierSummaries: ["Percentage discount: 5% for selected countries", "Nice price: Charm pricing (.99)"],
        storeCompatibilitySummaries: ["Different amounts for the same currency: Pick the median available price"],
        previewRows: makeSeededPreviewRows(9.99)
      },
      {
        number: 4,
        date: "Feb 12, 2026",
        products: ["com.dipsea.android.monthly", "com.dipsea.ios.monthly", "com.dipsea.web.monthly"],
        sourceSummary: "Reference price: USD 9.99 (Currency exchange rates)",
        modifierSummaries: ["Percentage discount: 10% for selected countries", "Nice price: Charm pricing (.99)"],
        storeCompatibilitySummaries: ["Different amounts for the same currency: Pick the median available price"],
        previewRows: makeSeededPreviewRows(9.99)
      }
    ]
  },
  {
    id: "tpl-holiday-promo",
    name: "Holiday promo",
    type: "Subscription",
    duration: "Annual",
    versions: [
      {
        number: 1,
        date: "Dec 01, 2025",
        products: ["com.dipsea.android.annual.5999"],
        sourceSummary: "Existing product: com.dipsea.android.annual.5999",
        modifierSummaries: ["Absolute discount: USD 1.00"],
        storeCompatibilitySummaries: [],
        previewRows: makeSeededPreviewRows(8.49)
      },
      {
        number: 2,
        date: "Jan 29, 2026",
        products: ["com.dipsea.android.annual.5999", "com.dipsea.ios.annual.5999"],
        sourceSummary: "Existing product: com.dipsea.android.annual.5999",
        modifierSummaries: ["Absolute discount: USD 2.00"],
        storeCompatibilitySummaries: ["Prices not available on the App Store: Round to nearest available price"],
        previewRows: makeSeededPreviewRows(7.49)
      }
    ]
  },
  {
    id: "tpl-regional-pricing",
    name: "Regional pricing",
    type: "Subscription",
    duration: "Monthly",
    versions: [
      {
        number: 1,
        date: "Mar 20, 2024",
        products: ["com.dipsea.android.monthly"],
        sourceSummary: "CSV upload",
        modifierSummaries: [],
        storeCompatibilitySummaries: [],
        previewRows: makeSeededPreviewRows(7.89)
      },
      {
        number: 2,
        date: "Jun 09, 2025",
        products: ["com.dipsea.android.monthly", "com.dipsea.ios.monthly"],
        sourceSummary: "CSV upload",
        modifierSummaries: ["Price override: EUR, Germany"],
        storeCompatibilitySummaries: ["Different amounts for the same currency: Specify the price"],
        previewRows: makeSeededPreviewRows(8.02)
      },
      {
        number: 3,
        date: "Jan 14, 2026",
        products: ["com.dipsea.android.monthly", "com.dipsea.ios.monthly"],
        sourceSummary: "CSV upload",
        modifierSummaries: ["Price override: EUR, Germany", "Price override: USD, United States"],
        storeCompatibilitySummaries: ["Different amounts for the same currency: Specify the price"],
        previewRows: makeSeededPreviewRows(8.25)
      }
    ]
  }
];

function OfferingsView() {
  return (
    <div className="view active">
      <div className="headline-row">
        <p className="copy">
          Offerings are the selection of products that are "offered" to a customer on your paywall.
          <br />
          They're an optional, but recommended feature of RevenueCat that can make it easier to change and
          experiment with your paywalls.
        </p>
        <button className="primary">+ New offering</button>
      </div>
      <p className="copy copy-tight">Offerings can also be used to test different pricing combinations as variants in an experiment.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Identifier</th>
              <th>Display name</th>
              <th>Packages</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offeringsRows.map((row) => (
              <tr key={row[0]}>
                <td><a className="row-link" href="#">{row[0]}</a></td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsView({ onOpenProductDetail }) {
  return (
    <div className="view active">
      <div className="headline-row">
        <p className="copy">Products are the individual in-app purchases you set up on the store platforms.</p>
        <button className="primary">New product</button>
      </div>
      <div className="search-row">Search products...</div>
      <div className="product-table-stack">
        {productsByStore.map((store) => (
          <div className="table-wrap" key={store.title}>
            <div className="subheader">{store.title} <span className="light-actions">+ New &nbsp; Import</span></div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Entitlements</th>
                  <th>Pricing template</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {store.rows.map((row) => (
                  <tr key={row.product}>
                    <td>
                      <button
                        className="row-link row-link-button"
                        type="button"
                        onClick={() => onOpenProductDetail(store.title, row)}
                      >
                        {row.product}
                      </button>
                    </td>
                    <td><span className="status">Published</span></td>
                    <td>1 Entitlement</td>
                    <td>{row.pricingTemplate}</td>
                    <td>{row.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetailPage({ product, onBackToProducts }) {
  const [activeTab, setActiveTab] = useState("setup");
  const [isPricingVersionMenuOpen, setIsPricingVersionMenuOpen] = useState(false);
  const [selectedPricingVersionLabel, setSelectedPricingVersionLabel] = useState("Current pricing");
  const isSubscription = product.productType === "Subscription";
  const pushTarget = product.appName.includes("(App Store)")
    ? "App Store"
    : product.appName.includes("(Play Store)")
      ? "Play Store"
      : product.appName.includes("(Stripe)")
        ? "Stripe"
        : null;

  return (
    <section className="panel">
      <div className="breadcrumb">
        Dipsea / Product catalog /{" "}
        <button className="table-action-link detail-breadcrumb-link" type="button" onClick={onBackToProducts}>
          Products
        </button>{" "}
        / <span className="crumb-current">{product.name}</span>
      </div>
      <div className="section">
        <div className="headline-row detail-header-row">
          <div>
            <h1>{product.name}</h1>
            <div className="product-meta-row">
              <span className="product-app-label">{product.appName}</span>
              <span className="status">{product.status}</span>
            </div>
          </div>
          <div className="detail-top-actions">
            <button className="secondary" type="button">Edit</button>
            {pushTarget ? (
              <button className="primary" type="button">{`Push changes to ${pushTarget}`}</button>
            ) : null}
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Product detail tabs">
          <button className={`tab${activeTab === "setup" ? " active" : ""}`} type="button" onClick={() => setActiveTab("setup")}>
            Setup
          </button>
          <button
            className={`tab${activeTab === "localization" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveTab("localization")}
          >
            Localization
          </button>
          <button
            className={`tab${activeTab === "trial-intro" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveTab("trial-intro")}
          >
            Trial / intro
          </button>
          <button className={`tab${activeTab === "pricing" ? " active" : ""}`} type="button" onClick={() => setActiveTab("pricing")}>
            Pricing
          </button>
          <button
            className={`tab${activeTab === "relationships" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveTab("relationships")}
          >
            Relationships
          </button>
          <button
            className={`tab${activeTab === "transactions" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveTab("transactions")}
          >
            Recent transactions
          </button>
        </div>

        {activeTab === "setup" ? (
          <section className="table-wrap">
            <table>
              <tbody>
                <tr>
                  <th>Product type</th>
                  <td>{product.productType.toLowerCase()}</td>
                </tr>
                {isSubscription ? (
                  <tr>
                    <th>Subscription duration</th>
                    <td>{product.subscriptionDuration}</td>
                  </tr>
                ) : null}
                {isSubscription ? (
                  <tr>
                    <th>Grace period</th>
                    <td>{product.gracePeriodDays} days</td>
                  </tr>
                ) : null}
                <tr>
                  <th>Tax category</th>
                  <td>{product.taxCategory}</td>
                </tr>
              </tbody>
            </table>
          </section>
        ) : null}

        {activeTab === "localization" ? (
          <section className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Locale</th>
                  <th>Display name</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {product.localizations.map((item) => (
                  <tr key={item.locale}>
                    <td>{item.locale}</td>
                    <td>{item.displayName}</td>
                    <td>{item.description}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {activeTab === "trial-intro" ? (
          <section className="table-wrap">
            <table>
              <tbody>
                <tr>
                  <th>Free trial configured</th>
                  <td>{product.trialIntro.freeTrialConfigured ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <th>Trial duration</th>
                  <td>{product.trialIntro.trialDuration || "—"}</td>
                </tr>
                <tr>
                  <th>Introductory offer configured</th>
                  <td>{product.trialIntro.introOfferConfigured ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <th>Introductory offer</th>
                  <td>{product.trialIntro.introOfferLabel || "—"}</td>
                </tr>
              </tbody>
            </table>
          </section>
        ) : null}

        {activeTab === "pricing" ? (
          <div className="builder-grid">
            <div className="builder-col">
              <section className="builder-card">
                <h2 className="builder-title">Pricing template</h2>
                <p className="copy detail-copy">
                  {product.linkedTemplateName !== "–"
                    ? `Linked to pricing template ${product.linkedTemplateName}, version ${product.linkedTemplateVersion}.`
                    : "Not linked to a pricing template."}
                </p>
                <div className="detail-inline-actions">
                  <button className="table-action-link" type="button">Unlink from pricing template</button>
                  <button className="table-action-link" type="button">Change prices to latest version</button>
                </div>
              </section>
              <section className="builder-card">
                <h2 className="builder-title">Source</h2>
                <p className="copy detail-copy">{product.sourceSummary}</p>
              </section>
              <section className="builder-card">
                <h2 className="builder-title">Modifiers</h2>
                {product.modifierSummaries.length ? (
                  <ul className="detail-list">
                    {product.modifierSummaries.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="copy detail-copy">No modifiers.</p>
                )}
              </section>
              <section className="builder-card">
                <h2 className="builder-title">Store compatibility</h2>
                {product.storeCompatibilitySummaries.length ? (
                  <ul className="detail-list">
                    {product.storeCompatibilitySummaries.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="copy detail-copy">No compatibility warnings.</p>
                )}
              </section>
            </div>
            <div className="builder-col">
              <section className="builder-card builder-card-preview">
                <div className="pricing-preview-head">
                  <div className="pricing-preview-title-group">
                    <h2 className="builder-title">{selectedPricingVersionLabel}</h2>
                    <div className="pricing-version-menu-wrap">
                      <button
                        className="pricing-version-trigger"
                        type="button"
                        onClick={() => setIsPricingVersionMenuOpen((open) => !open)}
                        aria-label="Select pricing version"
                      >
                        v
                      </button>
                      {isPricingVersionMenuOpen ? (
                        <div className="pricing-version-menu">
                          <button
                            className="pricing-version-item"
                            type="button"
                            onClick={() => {
                              setSelectedPricingVersionLabel("Past pricing");
                              setIsPricingVersionMenuOpen(false);
                            }}
                          >
                            Past pricing (Nov 01, 2025 - Feb 10, 2026)
                          </button>
                          <button
                            className="pricing-version-item"
                            type="button"
                            onClick={() => {
                              setSelectedPricingVersionLabel("Current pricing");
                              setIsPricingVersionMenuOpen(false);
                            }}
                          >
                            Current pricing (Feb 11, 2026 - Present)
                          </button>
                          <button
                            className="pricing-version-item"
                            type="button"
                            onClick={() => {
                              setSelectedPricingVersionLabel("Future pricing");
                              setIsPricingVersionMenuOpen(false);
                            }}
                          >
                            Future pricing (Mar 15, 2026 - Jun 30, 2026)
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <button className="table-action-link" type="button">Download as CSV</button>
                </div>
                <div className="table-wrap preview-table-wrap">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>Currency</th>
                        <th>Country</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.previewRows.map((row) => (
                        <tr key={row.key}>
                          <td>{row.currency}</td>
                          <td>{row.country || ""}</td>
                          <td>{row.formattedPrice}</td>
                          <td />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {activeTab === "relationships" ? (
          <div className="relationship-stack">
            <section className="table-wrap">
              <div className="table-header">
                <span className="table-title">Linked Entitlements</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Identifier</th>
                    <th>Description</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {product.linkedEntitlements.map((item) => (
                    <tr key={item.identifier}>
                      <td><a className="row-link" href="#">{item.identifier}</a></td>
                      <td>{item.description}</td>
                      <td>{item.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="table-wrap">
              <div className="table-header">
                <span className="table-title">Linked Offerings</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Identifier</th>
                    <th>Display Name</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {product.linkedOfferings.map((item) => (
                    <tr key={item.identifier}>
                      <td><a className="row-link" href="#">{item.identifier}</a></td>
                      <td>{item.displayName}</td>
                      <td>{item.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : null}

        {activeTab === "transactions" ? (
          <section className="table-wrap">
            <div className="table-header">
              <span className="table-title">Recent Transactions</span>
              <span className="transactions-toggle">Sandbox</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {product.recentTransactions.map((item) => (
                  <tr key={item.customerId}>
                    <td>
                      <span className="transaction-flag">US</span>{" "}
                      <a className="row-link" href="#">{item.customerId}</a>
                    </td>
                    <td>{item.purchaseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function EntitlementsView() {
  return (
    <div className="view active">
      <div className="headline-row">
        <p className="copy">
          An entitlement represents a level of access, features, or content that a customer is "entitled" to.
          <br />
          Many projects only have one entitlement, for example, "Pro access".
        </p>
        <button className="primary">+ New Entitlement</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Identifier</th>
              <th>Display Name</th>
              <th>Products</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {entitlementsRows.map((row) => (
              <tr key={row[0]}>
                <td><a className="row-link" href="#">{row[0]}</a></td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingView({ onCreateTemplate, onDuplicateTemplate, onOpenTemplateDetail, onDeleteTemplate, templates }) {
  const [openActionsIndex, setOpenActionsIndex] = useState(null);
  const [createProductsForRow, setCreateProductsForRow] = useState(null);
  const [appSelections, setAppSelections] = useState({
    appStore: { checked: false, productIdentifier: "", subscriptionGroup: "" },
    playStore: { checked: false, productIdentifier: "", subscription: "", newSubscriptionProductId: "" },
    stripe: { checked: false, productIdentifier: "" },
    rcBilling: { checked: false, productIdentifier: "" }
  });

  const appStoreGroups = [
    "New subscription group",
    "Premium monthly plans",
    "Core subscriptions",
    "Annual memberships"
  ];

  const playStoreSubscriptions = [
    "New subscription",
    "premium_monthly",
    "core_annual",
    "legacy_subscription_set"
  ];

  const rows = useMemo(
    () =>
      templates.map((template) => {
        const latestVersion = template.versions[template.versions.length - 1];
        return {
          id: template.id,
          name: template.name,
          productsLabel: `${latestVersion.products.length} products`,
          versionsLabel: `${template.versions.length} ${template.versions.length === 1 ? "version" : "versions"}`,
          lastModified: latestVersion.date
        };
      }),
    [templates]
  );

  const toggleApp = (key) => {
    setAppSelections((prev) => ({
      ...prev,
      [key]: { ...prev[key], checked: !prev[key].checked }
    }));
  };

  const updateAppField = (key, field, value) => {
    setAppSelections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const openCreateProductsModal = (index) => {
    setCreateProductsForRow(index);
    setAppSelections({
      appStore: { checked: false, productIdentifier: "", subscriptionGroup: "" },
      playStore: { checked: false, productIdentifier: "", subscription: "", newSubscriptionProductId: "" },
      stripe: { checked: false, productIdentifier: "" },
      rcBilling: { checked: false, productIdentifier: "" }
    });
  };

  return (
    <div className="view active">
      <p className="copy">Set up and adjust pricing across products and stores.</p>
      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">Pricing templates</span>
          <button className="primary primary-compact" onClick={onCreateTemplate} type="button">New template</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Products</th>
              <th>Versions</th>
              <th>Last modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <button
                    className="row-link row-link-button"
                    type="button"
                    onClick={() => onOpenTemplateDetail(row.id)}
                  >
                    {row.name}
                  </button>
                </td>
                <td>{row.productsLabel}</td>
                <td>{row.versionsLabel}</td>
                <td>{row.lastModified}</td>
                <td className="cell-actions">
                  <div className="overflow-menu-wrap">
                    <button
                      className="overflow-trigger"
                      type="button"
                      onClick={() => setOpenActionsIndex((current) => (current === index ? null : index))}
                    >
                      ...
                    </button>
                    {openActionsIndex === index ? (
                      <div className="overflow-menu">
                        <button
                          className="overflow-menu-item"
                          type="button"
                          onClick={() => {
                            openCreateProductsModal(index);
                            setOpenActionsIndex(null);
                          }}
                        >
                          Create products from template
                        </button>
                        <button
                          className="overflow-menu-item"
                          type="button"
                          onClick={() => {
                            onDuplicateTemplate(row.id);
                            setOpenActionsIndex(null);
                          }}
                        >
                          Duplicate
                        </button>
                        <button
                          className="overflow-menu-item overflow-menu-item-danger"
                          type="button"
                          onClick={() => {
                            onDeleteTemplate(row.id);
                            setOpenActionsIndex(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createProductsForRow !== null ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create products from template">
          <div className="modal-card">
            <div className="modal-head">
              <h3 className="modal-title">Create products from template</h3>
              <button className="modifier-remove" type="button" onClick={() => setCreateProductsForRow(null)}>x</button>
            </div>
            <p className="modal-subtitle">
              {`Template: ${rows[createProductsForRow].name}`}
            </p>

            <div className="modal-app-list">
              <div className="modal-app-row">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={appSelections.appStore.checked}
                    onChange={() => toggleApp("appStore")}
                  />
                  <span>Dipsea (App Store)</span>
                </label>
                {appSelections.appStore.checked ? (
                  <>
                    <div className="modal-app-fields">
                      <div className="field">
                        <label className="field-label" htmlFor="app-store-subscription-group">Subscription group</label>
                      <select
                        id="app-store-subscription-group"
                        className="field-control"
                        value={appSelections.appStore.subscriptionGroup}
                        onChange={(event) => updateAppField("appStore", "subscriptionGroup", event.target.value)}
                      >
                        <option value="">Select subscription group</option>
                        {appStoreGroups.map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                        </select>
                      </div>
                      {appSelections.appStore.subscriptionGroup === "New subscription group" ? (
                        <div className="field">
                          <label className="field-label" htmlFor="app-store-subscription-group-ref-name">
                            New subscription group reference name
                          </label>
                          <input
                            id="app-store-subscription-group-ref-name"
                            className="field-control"
                            type="text"
                            value={appSelections.appStore.newSubscriptionGroupReferenceName || ""}
                            onChange={(event) =>
                              updateAppField("appStore", "newSubscriptionGroupReferenceName", event.target.value)
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="app-store-product-id">Product identifier</label>
                      <input
                        id="app-store-product-id"
                        className="field-control"
                        type="text"
                        value={appSelections.appStore.productIdentifier}
                        onChange={(event) => updateAppField("appStore", "productIdentifier", event.target.value)}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <div className="modal-app-row">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={appSelections.playStore.checked}
                    onChange={() => toggleApp("playStore")}
                  />
                  <span>Dipsea (Play Store)</span>
                </label>
                {appSelections.playStore.checked ? (
                  <>
                    <div className="modal-app-fields">
                      <div className="field">
                        <label className="field-label" htmlFor="play-store-subscription">Subscription</label>
                      <select
                        id="play-store-subscription"
                        className="field-control"
                        value={appSelections.playStore.subscription}
                        onChange={(event) => updateAppField("playStore", "subscription", event.target.value)}
                      >
                        <option value="">Select subscription</option>
                        {playStoreSubscriptions.map((subscription) => (
                          <option key={subscription} value={subscription}>{subscription}</option>
                        ))}
                        </select>
                      </div>
                      {appSelections.playStore.subscription === "New subscription" ? (
                        <div className="field">
                          <label className="field-label" htmlFor="play-store-new-subscription-product-id">
                            New subscription group reference name
                          </label>
                          <input
                            id="play-store-new-subscription-product-id"
                            className="field-control"
                            type="text"
                            value={appSelections.playStore.newSubscriptionProductId}
                            onChange={(event) => updateAppField("playStore", "newSubscriptionProductId", event.target.value)}
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="play-store-product-id">Base plan ID</label>
                      <input
                        id="play-store-product-id"
                        className="field-control"
                        type="text"
                        value={appSelections.playStore.productIdentifier}
                        onChange={(event) => updateAppField("playStore", "productIdentifier", event.target.value)}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <div className="modal-app-row">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={appSelections.stripe.checked}
                    onChange={() => toggleApp("stripe")}
                  />
                  <span>Dipsea (Stripe)</span>
                </label>
                {appSelections.stripe.checked ? (
                  <div className="modal-app-fields">
                    <div className="field">
                      <label className="field-label" htmlFor="stripe-product-id">Product identifier</label>
                      <input
                        id="stripe-product-id"
                        className="field-control"
                        type="text"
                        value={appSelections.stripe.productIdentifier}
                        onChange={(event) => updateAppField("stripe", "productIdentifier", event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="modal-app-row">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={appSelections.rcBilling.checked}
                    onChange={() => toggleApp("rcBilling")}
                  />
                  <span>Dipsea (RevenueCat Billing)</span>
                </label>
                {appSelections.rcBilling.checked ? (
                  <div className="modal-app-fields">
                    <div className="field">
                      <label className="field-label" htmlFor="rc-billing-product-id">Product identifier</label>
                      <input
                        id="rc-billing-product-id"
                        className="field-control"
                        type="text"
                        value={appSelections.rcBilling.productIdentifier}
                        onChange={(event) => updateAppField("rcBilling", "productIdentifier", event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="modal-actions">
              <button className="secondary" type="button" onClick={() => setCreateProductsForRow(null)}>Cancel</button>
              <button className="primary" type="button" onClick={() => setCreateProductsForRow(null)}>Create products</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VirtualCurrenciesView() {
  return (
    <div className="view active">
      <div className="headline-row">
        <p className="copy">Virtual currencies view placeholder for prototype.</p>
        <button className="primary">+ New Currency</button>
      </div>
    </div>
  );
}

function TemplateDetailPage({ template, onEditTemplate, onBackToPricing }) {
  const [selectedVersionNumber, setSelectedVersionNumber] = useState(template.versions[template.versions.length - 1].number);
  const selectedVersion = useMemo(
    () =>
      template.versions.find((version) => version.number === selectedVersionNumber) ||
      template.versions[template.versions.length - 1],
    [selectedVersionNumber, template.versions]
  );

  return (
    <section className="panel">
      <div className="breadcrumb">
        Product Catalog &gt;{" "}
        <button className="table-action-link detail-breadcrumb-link" type="button" onClick={onBackToPricing}>
          Pricing
        </button>{" "}
        &gt; <span className="crumb-current">{template.name}</span>
      </div>
      <div className="section">
        <div className="headline-row detail-header-row">
          <div>
            <h1>{template.name}</h1>
            <p className="copy copy-meta">
              {template.type}
              {template.type === "Subscription" && template.duration ? ` • ${template.duration}` : ""}
            </p>
          </div>
          <button className="primary" type="button" onClick={onEditTemplate}>Edit</button>
        </div>

        <section className="builder-card detail-versions-card">
          <h2 className="builder-title">Versions</h2>
          <div className="field detail-version-select">
            <label className="field-label" htmlFor="template-version-select">Version</label>
            <select
              id="template-version-select"
              className="field-control"
              value={selectedVersionNumber}
              onChange={(event) => setSelectedVersionNumber(Number(event.target.value))}
            >
              {[...template.versions]
                .sort((a, b) => b.number - a.number)
                .map((version) => (
                  <option key={version.number} value={version.number}>
                    {`v${version.number} • ${version.date} • ${version.products.length} products`}
                  </option>
                ))}
            </select>
          </div>
        </section>

        <div className="builder-grid">
          <div className="builder-col">
            <section className="builder-card">
              <h2 className="builder-title">Products</h2>
              {selectedVersion.products.length ? (
                <ul className="detail-list">
                  {selectedVersion.products.map((productId) => (
                    <li key={productId}>{productId}</li>
                  ))}
                </ul>
              ) : (
                <p className="copy detail-copy">No products attached.</p>
              )}
            </section>
            <section className="builder-card">
              <h2 className="builder-title">Source</h2>
              <p className="copy detail-copy">{selectedVersion.sourceSummary}</p>
            </section>
            <section className="builder-card">
              <h2 className="builder-title">Modifiers</h2>
              {selectedVersion.modifierSummaries.length ? (
                <ul className="detail-list">
                  {selectedVersion.modifierSummaries.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="copy detail-copy">No modifiers.</p>
              )}
            </section>
            <section className="builder-card">
              <h2 className="builder-title">Store compatibility</h2>
              {selectedVersion.storeCompatibilitySummaries.length ? (
                <ul className="detail-list">
                  {selectedVersion.storeCompatibilitySummaries.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="copy detail-copy">No compatibility warnings.</p>
              )}
            </section>
          </div>
          <div className="builder-col">
            <section className="builder-card builder-card-preview">
              <h2 className="builder-title">Preview</h2>
              <div className="table-wrap preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Currency</th>
                      <th>Country</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVersion.previewRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.currency}</td>
                        <td>{row.country || ""}</td>
                        <td>{row.formattedPrice}</td>
                        <td />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewPricingTemplatePage({ mode, templateName, onTemplateNameChange }) {
  const [sourceType, setSourceType] = useState("Reference price");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [convertUsing, setConvertUsing] = useState("Currency exchange rates");
  const [sourceConversionAsOf, setSourceConversionAsOf] = useState(() => Date.now());
  const [existingProduct, setExistingProduct] = useState(productsRows[0][0]);
  const [geoAvailabilityAllCountries, setGeoAvailabilityAllCountries] = useState(true);
  const [geoAvailabilityCountries, setGeoAvailabilityCountries] = useState([]);
  const [productType, setProductType] = useState("Subscription");
  const [duration, setDuration] = useState("Monthly");
  const [isModifierMenuOpen, setIsModifierMenuOpen] = useState(false);
  const [modifiers, setModifiers] = useState([]);
  const [appStoreResolution, setAppStoreResolution] = useState("Round to nearest available price");
  const [sameCurrencyResolution, setSameCurrencyResolution] = useState("Pick the lowest available price");
  const [specifiedCurrencyPrices, setSpecifiedCurrencyPrices] = useState({});
  const [missingGeosResolution, setMissingGeosResolution] = useState("Make product unavailable in the missing geos");
  const [missingGeosReferencePrice, setMissingGeosReferencePrice] = useState(getPreviewRowKey("USD", "United States"));
  const [missingGeosConvertUsing, setMissingGeosConvertUsing] = useState("Currency exchange rates");
  const [missingGeosConversionAsOf, setMissingGeosConversionAsOf] = useState(() => Date.now());
  const previewRows = useMemo(
    () =>
      previewTemplateRows.map((row) => ({
        ...row,
        key: getPreviewRowKey(row.currency, row.country),
        label: getPreviewRowLabel(row.currency, row.country)
      })),
    []
  );

  const addModifier = (type) => {
    const base = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type
    };
    if (type === "Percentage discount") {
      setModifiers((prev) => [...prev, { ...base, allCountries: true, countries: [], discountPercentage: "" }]);
    } else if (type === "Absolute discount") {
      setModifiers((prev) => [...prev, { ...base, currency: "USD", discountAmount: "" }]);
    } else if (type === "Price override") {
      setModifiers((prev) => [...prev, { ...base, applyTo: previewRows[0].key, newAmount: "" }]);
    } else {
      setModifiers((prev) => [...prev, { ...base, method: nicePriceMethods[0] }]);
    }
    setIsModifierMenuOpen(false);
  };

  const removeModifier = (id) => {
    setModifiers((prev) => prev.filter((modifier) => modifier.id !== id));
  };

  const updateModifier = (id, updater) => {
    setModifiers((prev) =>
      prev.map((modifier) => {
        if (modifier.id !== id) {
          return modifier;
        }
        return typeof updater === "function" ? updater(modifier) : { ...modifier, ...updater };
      })
    );
  };

  const getCountrySummary = (modifier) => {
    if (modifier.allCountries) {
      return "All countries";
    }
    if (!modifier.countries.length) {
      return "No countries selected";
    }
    if (modifier.countries.length <= 2) {
      return modifier.countries.join(", ");
    }
    return `${modifier.countries.length} countries selected`;
  };

  const getGeoAvailabilitySummary = () => {
    if (geoAvailabilityAllCountries) {
      return "All countries";
    }
    if (!geoAvailabilityCountries.length) {
      return "No countries selected";
    }
    if (geoAvailabilityCountries.length <= 2) {
      return geoAvailabilityCountries.join(", ");
    }
    return `${geoAvailabilityCountries.length} countries selected`;
  };

  const computedPreviewRows = useMemo(() => {
    let baseUsd = 9.99;
    if (sourceType === "Reference price") {
      const typedAmount = parseAmount(amount);
      const sourceRate = fxRates[currency] || 1;
      const sourceInUsd = typedAmount > 0 ? typedAmount / sourceRate : 9.99;
      const methodFactor = conversionFactors[convertUsing] || 1;
      baseUsd = sourceInUsd * methodFactor;
    } else if (sourceType === "Existing product") {
      baseUsd = productSeed(existingProduct);
    } else if (sourceType === "CSV upload") {
      baseUsd = 8.49;
    }

    return previewRows.map((row) => {
      const rate = fxRates[row.currency] || 1;
      let value = baseUsd * rate;

      modifiers.forEach((modifier) => {
        if (modifier.type === "Percentage discount") {
          const pct = parseAmount(modifier.discountPercentage);
          const applies = modifier.allCountries || (row.country && modifier.countries.includes(row.country));
          if (applies && pct > 0) {
            value *= Math.max(0, 1 - pct / 100);
          }
        }
      });

      modifiers.forEach((modifier) => {
        if (modifier.type === "Absolute discount" && modifier.currency === row.currency) {
          value -= parseAmount(modifier.discountAmount);
        }
      });

      modifiers.forEach((modifier) => {
        if (modifier.type === "Nice price (.99)") {
          if (modifier.method === "Round pricing (.00)") {
            value = Math.round(value);
          } else {
            const floored = Math.floor(value);
            value = floored + 0.99;
          }
        }
      });

      modifiers.forEach((modifier) => {
        if (modifier.type === "Price override" && modifier.applyTo === row.key) {
          const override = parseAmount(modifier.newAmount);
          if (override > 0) {
            value = override;
          }
        }
      });

      const normalized = Math.max(0, value);
      return {
        ...row,
        amount: normalizeAmountForCurrency(row.currency, normalized),
        formattedPrice: formatPrice(row.currency, normalized)
      };
    });
  }, [amount, convertUsing, currency, existingProduct, modifiers, previewRows, sourceType]);

  const hasAppStoreUnavailablePrices = useMemo(
    () =>
      computedPreviewRows.some((row) => {
        if (getCurrencyDecimals(row.currency) === 0) {
          return false;
        }
        const cents = Math.round((row.amount - Math.floor(row.amount)) * 100);
        return cents !== 0 && cents !== 90 && cents !== 95 && cents !== 99;
      }),
    [computedPreviewRows]
  );

  const conflictingCurrencies = useMemo(() => {
    const grouped = new Map();
    computedPreviewRows.forEach((row) => {
      const existing = grouped.get(row.currency) || new Set();
      existing.add(row.amount.toFixed(getCurrencyDecimals(row.currency)));
      grouped.set(row.currency, existing);
    });
    return Array.from(grouped.entries())
      .filter(([, values]) => values.size > 1)
      .map(([currencyCode]) => currencyCode);
  }, [computedPreviewRows]);

  const addOverrideForRow = (row) => {
    const modifier = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "Price override",
      applyTo: row.key,
      newAmount: row.amount.toFixed(row.currency === "JPY" ? 0 : 2)
    };
    setModifiers((prev) => [...prev, modifier]);
  };

  return (
    <section className="panel">
      <div className="section">
        <h1>{mode === "edit" ? "Edit pricing template" : "New pricing template"}</h1>
        <div className="builder-grid">
          <div className="builder-col">
            <section className="builder-card">
              <h2 className="builder-title">Setup</h2>
              <div className="source-fields">
                <div className="field">
                  <label className="field-label" htmlFor="template-name">Template name</label>
                  <input
                    id="template-name"
                    className="field-control"
                    type="text"
                    placeholder="Enter template name"
                    value={templateName}
                    onChange={(event) => onTemplateNameChange(event.target.value)}
                  />
                </div>
                <div className="field">
                  <span className="field-label">Product type</span>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="product-type"
                        value="Subscription"
                        checked={productType === "Subscription"}
                        onChange={(event) => setProductType(event.target.value)}
                      />
                      <span>Subscription</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="product-type"
                        value="Consumable"
                        checked={productType === "Consumable"}
                        onChange={(event) => setProductType(event.target.value)}
                      />
                      <span>Consumable</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="product-type"
                        value="Non-consumable"
                        checked={productType === "Non-consumable"}
                        onChange={(event) => setProductType(event.target.value)}
                      />
                      <span>Non-consumable</span>
                    </label>
                  </div>
                </div>
                {productType === "Subscription" ? (
                  <div className="field">
                    <label className="field-label" htmlFor="duration">Duration</label>
                    <select
                      id="duration"
                      className="field-control"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="builder-card">
              <h2 className="builder-title">Source</h2>
              <div className="source-fields">
                <div className="field">
                  <label className="field-label" htmlFor="source-type">Type</label>
                  <select
                    id="source-type"
                    className="field-control"
                    value={sourceType}
                    onChange={(event) => setSourceType(event.target.value)}
                  >
                    {sourceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {sourceType === "Reference price" ? (
                  <>
                    <div className="field">
                      <label className="field-label" htmlFor="currency">Currency</label>
                      <select
                        id="currency"
                        className="field-control"
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                      >
                        {currencyOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="amount">Amount</label>
                      <input
                        id="amount"
                        className="field-control"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="convert-using">Convert using</label>
                      <select
                        id="convert-using"
                        className="field-control"
                        value={convertUsing}
                        onChange={(event) => {
                          setConvertUsing(event.target.value);
                          setSourceConversionAsOf(Date.now());
                        }}
                      >
                        {convertUsingOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <p className="conversion-note">
                        {`Using conversion rates as of ${formatConversionAsOf(sourceConversionAsOf)}. `}
                        <button
                          className="table-action-link conversion-note-link"
                          type="button"
                          onClick={() => setSourceConversionAsOf(Date.now())}
                        >
                          Update conversion rates
                        </button>
                      </p>
                    </div>
                    <div className="field">
                      <label className="field-label">Geo availability</label>
                      <details className="checkbox-select">
                        <summary className="field-control checkbox-summary">{getGeoAvailabilitySummary()}</summary>
                        <div className="checkbox-panel">
                          <label className="checkbox-option">
                            <input
                              type="checkbox"
                              checked={geoAvailabilityAllCountries}
                              onChange={(event) => {
                                setGeoAvailabilityAllCountries(event.target.checked);
                                if (event.target.checked) {
                                  setGeoAvailabilityCountries([]);
                                }
                              }}
                            />
                            <span>All countries</span>
                          </label>
                          {countryOptions.map((country) => (
                            <label key={country} className="checkbox-option">
                              <input
                                type="checkbox"
                                checked={geoAvailabilityCountries.includes(country)}
                                disabled={geoAvailabilityAllCountries}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    setGeoAvailabilityCountries((prev) => [...prev, country]);
                                  } else {
                                    setGeoAvailabilityCountries((prev) => prev.filter((value) => value !== country));
                                  }
                                }}
                              />
                              <span>{country}</span>
                            </label>
                          ))}
                        </div>
                      </details>
                    </div>
                  </>
                ) : null}

                {sourceType === "Existing product" ? (
                  <div className="field">
                    <label className="field-label" htmlFor="existing-product">Product</label>
                    <select
                      id="existing-product"
                      className="field-control"
                      value={existingProduct}
                      onChange={(event) => setExistingProduct(event.target.value)}
                    >
                      {productsRows.map((product) => (
                        <option key={product[0]} value={product[0]}>{product[0]}</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {sourceType === "CSV upload" ? (
                  <div className="field">
                    <div className="dropzone" role="button" tabIndex={0}>
                      <div className="dropzone-title">Drop CSV file here</div>
                      <div className="dropzone-subtitle">or click to upload</div>
                    </div>
                    <a
                      className="template-link"
                      href="data:text/csv;charset=utf-8,product_id,currency,amount%0Acom.example.product,USD,9.99%0A"
                      download="pricing-template.csv"
                    >
                      Download CSV template
                    </a>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="builder-card">
              <div className="modifiers-head">
                <h2 className="builder-title">Modifiers</h2>
                <button
                  className="modifier-add-cta"
                  type="button"
                  onClick={() => setIsModifierMenuOpen((open) => !open)}
                >
                  Add modifier
                </button>
                {isModifierMenuOpen ? (
                  <div className="modifier-menu">
                    {modifierOptions.map((option) => (
                      <button
                        key={option}
                        className="modifier-menu-item"
                        type="button"
                        onClick={() => addModifier(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {modifiers.length ? (
                <div className="modifier-list">
                  {modifiers.map((modifier) => (
                    <div key={modifier.id} className="modifier-row">
                      <div className="modifier-row-head">
                        <h3 className="modifier-row-title">{modifier.type}</h3>
                        <button
                          className="modifier-remove"
                          type="button"
                          aria-label={`Remove ${modifier.type}`}
                          onClick={() => removeModifier(modifier.id)}
                        >
                          x
                        </button>
                      </div>

                      {modifier.type === "Percentage discount" ? (
                        <div className="source-fields">
                          <div className="field">
                            <label className="field-label">Apply to</label>
                            <details className="checkbox-select">
                              <summary className="field-control checkbox-summary">{getCountrySummary(modifier)}</summary>
                              <div className="checkbox-panel">
                                <label className="checkbox-option">
                                  <input
                                    type="checkbox"
                                    checked={modifier.allCountries}
                                    onChange={(event) =>
                                      updateModifier(modifier.id, {
                                        allCountries: event.target.checked,
                                        countries: event.target.checked ? [] : modifier.countries
                                      })
                                    }
                                  />
                                  <span>All countries</span>
                                </label>
                                {countryOptions.map((country) => (
                                  <label key={country} className="checkbox-option">
                                    <input
                                      type="checkbox"
                                      checked={modifier.countries.includes(country)}
                                      disabled={modifier.allCountries}
                                      onChange={(event) =>
                                        updateModifier(modifier.id, (current) => ({
                                          ...current,
                                          countries: event.target.checked
                                            ? [...current.countries, country]
                                            : current.countries.filter((value) => value !== country)
                                        }))
                                      }
                                    />
                                    <span>{country}</span>
                                  </label>
                                ))}
                              </div>
                            </details>
                          </div>
                          <div className="field">
                            <label className="field-label" htmlFor={`${modifier.id}-discount-percentage`}>Discount percentage</label>
                            <input
                              id={`${modifier.id}-discount-percentage`}
                              className="field-control"
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={modifier.discountPercentage}
                              onChange={(event) => updateModifier(modifier.id, { discountPercentage: event.target.value })}
                            />
                          </div>
                        </div>
                      ) : null}

                      {modifier.type === "Absolute discount" ? (
                        <div className="source-fields">
                          <div className="field">
                            <label className="field-label" htmlFor={`${modifier.id}-absolute-currency`}>Apply to</label>
                            <select
                              id={`${modifier.id}-absolute-currency`}
                              className="field-control"
                              value={modifier.currency}
                              onChange={(event) => updateModifier(modifier.id, { currency: event.target.value })}
                            >
                              {currencyOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <label className="field-label" htmlFor={`${modifier.id}-discount-amount`}>Discount amount</label>
                            <input
                              id={`${modifier.id}-discount-amount`}
                              className="field-control"
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={modifier.discountAmount}
                              onChange={(event) => updateModifier(modifier.id, { discountAmount: event.target.value })}
                            />
                          </div>
                        </div>
                      ) : null}

                      {modifier.type === "Price override" ? (
                        <div className="source-fields">
                          <div className="field">
                            <label className="field-label" htmlFor={`${modifier.id}-override-row`}>Apply to</label>
                            <select
                              id={`${modifier.id}-override-row`}
                              className="field-control"
                              value={modifier.applyTo}
                              onChange={(event) => updateModifier(modifier.id, { applyTo: event.target.value })}
                            >
                              {previewRows.map((row) => (
                                <option key={row.key} value={row.key}>{row.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <label className="field-label" htmlFor={`${modifier.id}-new-amount`}>New amount</label>
                            <input
                              id={`${modifier.id}-new-amount`}
                              className="field-control"
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={modifier.newAmount}
                              onChange={(event) => updateModifier(modifier.id, { newAmount: event.target.value })}
                            />
                          </div>
                        </div>
                      ) : null}

                      {modifier.type === "Nice price (.99)" ? (
                        <div className="source-fields">
                          <div className="field">
                            <label className="field-label" htmlFor={`${modifier.id}-nice-method`}>Method</label>
                            <select
                              id={`${modifier.id}-nice-method`}
                              className="field-control"
                              value={modifier.method}
                              onChange={(event) => updateModifier(modifier.id, { method: event.target.value })}
                            >
                              {nicePriceMethods.map((method) => (
                                <option key={method} value={method}>{method}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="builder-card">
              <h2 className="builder-title">Store compatibility</h2>
              <div className="compatibility-list">
                {hasAppStoreUnavailablePrices ? (
                  <section className="compatibility-warning">
                    <h3 className="compatibility-title">Prices not available on the App Store</h3>
                    <p className="compatibility-text">Some prices are not available on the App Store.</p>
                    <div className="field">
                      <label className="field-label" htmlFor="app-store-resolution">Resolution</label>
                      <select
                        id="app-store-resolution"
                        className="field-control"
                        value={appStoreResolution}
                        onChange={(event) => setAppStoreResolution(event.target.value)}
                      >
                        <option value="Round to nearest available price">Round to nearest available price</option>
                        <option value="Round down to next available price">Round down to next available price</option>
                        <option value="Round up to next available price">Round up to next available price</option>
                      </select>
                    </div>
                  </section>
                ) : null}

                {conflictingCurrencies.length ? (
                  <section className="compatibility-warning">
                    <h3 className="compatibility-title">Different amounts for the same currency</h3>
                    <p className="compatibility-text">
                      Stripe and RevenueCat Billing do not allow differentiating amounts for the same currency by country.
                    </p>
                    <div className="field">
                      <label className="field-label" htmlFor="same-currency-resolution">Resolution</label>
                      <select
                        id="same-currency-resolution"
                        className="field-control"
                        value={sameCurrencyResolution}
                        onChange={(event) => setSameCurrencyResolution(event.target.value)}
                      >
                        <option value="Pick the lowest available price">Pick the lowest available price</option>
                        <option value="Pick the highest available price">Pick the highest available price</option>
                        <option value="Pick the median available price">Pick the median available price</option>
                        <option value="Specify the price">Specify the price</option>
                      </select>
                    </div>
                    {sameCurrencyResolution === "Specify the price" ? (
                      <div className="compatibility-input-grid">
                        {conflictingCurrencies.map((currencyCode) => (
                          <div key={currencyCode} className="field">
                            <label className="field-label" htmlFor={`specific-${currencyCode}`}>{currencyCode}</label>
                            <input
                              id={`specific-${currencyCode}`}
                              className="field-control"
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={specifiedCurrencyPrices[currencyCode] || ""}
                              onChange={(event) =>
                                setSpecifiedCurrencyPrices((prev) => ({
                                  ...prev,
                                  [currencyCode]: event.target.value
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {sourceType === "CSV upload" ? (
                  <section className="compatibility-warning">
                    <h3 className="compatibility-title">Missing geos / currencies on the App Store</h3>
                    <p className="compatibility-text">Some geos / currencies that are available on the App Store are missing.</p>
                    <div className="field">
                      <label className="field-label" htmlFor="missing-geos-resolution">Resolution</label>
                      <select
                        id="missing-geos-resolution"
                        className="field-control"
                        value={missingGeosResolution}
                        onChange={(event) => setMissingGeosResolution(event.target.value)}
                      >
                        <option value="Make product unavailable in the missing geos">
                          Make product unavailable in the missing geos
                        </option>
                        <option value="Convert price to missing geos">Convert price to missing geos</option>
                      </select>
                    </div>
                    {missingGeosResolution === "Convert price to missing geos" ? (
                      <>
                        <div className="field">
                          <label className="field-label" htmlFor="missing-geos-reference-price">Reference price</label>
                          <select
                            id="missing-geos-reference-price"
                            className="field-control"
                            value={missingGeosReferencePrice}
                            onChange={(event) => setMissingGeosReferencePrice(event.target.value)}
                          >
                            {previewRows.map((row) => (
                              <option key={row.key} value={row.key}>{row.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label className="field-label" htmlFor="missing-geos-convert-using">Convert using</label>
                          <select
                            id="missing-geos-convert-using"
                            className="field-control"
                            value={missingGeosConvertUsing}
                            onChange={(event) => {
                              setMissingGeosConvertUsing(event.target.value);
                              setMissingGeosConversionAsOf(Date.now());
                            }}
                          >
                            {convertUsingOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <p className="conversion-note">
                            {`Using conversion rates as of ${formatConversionAsOf(missingGeosConversionAsOf)}. `}
                            <button
                              className="table-action-link conversion-note-link"
                              type="button"
                              onClick={() => setMissingGeosConversionAsOf(Date.now())}
                            >
                              Update conversion rates
                            </button>
                          </p>
                        </div>
                      </>
                    ) : null}
                  </section>
                ) : null}
              </div>
            </section>
          </div>

          <div className="builder-col">
            <section className="builder-card builder-card-preview">
              <div className="modifiers-head">
                <h2 className="builder-title">Preview</h2>
                <button className="table-action-link" type="button">Download as CSV</button>
              </div>
              <div className="table-wrap preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Currency</th>
                      <th>Country</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedPreviewRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.currency}</td>
                        <td>{row.country || ""}</td>
                        <td>{row.formattedPrice}</td>
                        <td>
                          <button
                            className="table-action-link"
                            type="button"
                            onClick={() => addOverrideForRow(row)}
                          >
                            override
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("offerings");
  const [page, setPage] = useState("catalog");
  const [templates, setTemplates] = useState(initialTemplates);
  const [draftTemplateName, setDraftTemplateName] = useState("");
  const [templateEditorMode, setTemplateEditorMode] = useState("create");
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [viewingTemplateId, setViewingTemplateId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const crumbLabel = useMemo(() => {
    const found = tabs.find((tab) => tab.id === activeTab);
    return found ? found.label : "Offerings";
  }, [activeTab]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === viewingTemplateId) || null,
    [templates, viewingTemplateId]
  );

  const createTemplate = () => {
    setTemplateEditorMode("create");
    setEditingTemplateId(null);
    setDraftTemplateName("");
    setPage("new-pricing-template");
  };

  const openTemplateDetail = (templateId) => {
    setViewingTemplateId(templateId);
    setPage("template-detail");
  };

  const duplicateTemplate = (templateId) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    setTemplateEditorMode("create");
    setEditingTemplateId(null);
    setDraftTemplateName(`${template.name} (copy)`);
    setPage("new-pricing-template");
  };

  const editTemplate = (templateId) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    setTemplateEditorMode("edit");
    setEditingTemplateId(templateId);
    setDraftTemplateName(template.name);
    setPage("new-pricing-template");
  };

  const goToPricingTab = () => {
    setPage("catalog");
    setActiveTab("pricing");
  };

  const goToProductsTab = () => {
    setPage("catalog");
    setActiveTab("products");
  };

  const openProductDetail = (storeTitle, row) => {
    const linkedTemplate = templates.find((template) => template.name === row.pricingTemplate) || null;
    const latestVersion = linkedTemplate ? linkedTemplate.versions[linkedTemplate.versions.length - 1] : null;
    const productType = row.product.includes("gift") ? "Consumable" : "Subscription";
    const subscriptionDuration = row.product.includes("annual")
      ? "Annual"
      : row.product.includes("weekly")
        ? "Weekly"
        : "Monthly";

    setSelectedProduct({
      name: row.product,
      appName: storeTitle,
      status: "Published",
      productType,
      subscriptionDuration,
      gracePeriodDays: 7,
      taxCategory: "Digital app sales",
      linkedTemplateName: row.pricingTemplate,
      linkedTemplateVersion: latestVersion ? latestVersion.number : "—",
      sourceSummary: latestVersion ? latestVersion.sourceSummary : "No linked pricing source.",
      modifierSummaries: latestVersion ? latestVersion.modifierSummaries : [],
      storeCompatibilitySummaries: latestVersion ? latestVersion.storeCompatibilitySummaries : [],
      previewRows: latestVersion ? latestVersion.previewRows : makeSeededPreviewRows(9.99),
      linkedEntitlements: [
        { identifier: "subscriptions", description: "Subscriptions", created: "Sep 04, 2018" }
      ],
      linkedOfferings: [
        { identifier: "default", displayName: "our standard set of packages", created: "May 19, 2020" },
        { identifier: "lowercost-us-4899", displayName: "AB test for lowercost us", created: "Feb 13, 2023" },
        { identifier: "30_percent_off_flash_sale", displayName: "305 off flash sale", created: "Feb 25, 2025" }
      ],
      localizations: [
        {
          locale: "English (US)",
          displayName: "Dipsea Premium",
          description: "Full access to stories and sleep content.",
          status: "Published"
        },
        {
          locale: "Spanish (ES)",
          displayName: "Dipsea Premium",
          description: "Acceso completo a historias y contenido para dormir.",
          status: "In review"
        },
        {
          locale: "French (FR)",
          displayName: "Dipsea Premium",
          description: "Acces complet aux histoires et contenus de sommeil.",
          status: "Published"
        }
      ],
      trialIntro: {
        freeTrialConfigured: true,
        trialDuration: "7 days",
        introOfferConfigured: true,
        introOfferLabel: "50% off for 3 months"
      },
      recentTransactions: [
        { customerId: "0Bxy6CzYtATLbYMtp6eaOQSCItx1", purchaseDate: "Feb 18, 2026" },
        { customerId: "jPxOKRNk27ZFbQQLEL7xgeZeJN92", purchaseDate: "Feb 18, 2026" },
        { customerId: "xntUmIlfklQkKpM6yxotTPBd1463", purchaseDate: "Feb 18, 2026" },
        { customerId: "AF88pUxuksOo0msacJvvVnrwogq1", purchaseDate: "Feb 18, 2026" }
      ]
    });
    setPage("product-detail");
  };

  const saveTemplate = () => {
    const trimmedName = draftTemplateName.trim();
    const editingTemplate = templates.find((template) => template.id === editingTemplateId);
    const templateName =
      trimmedName || (templateEditorMode === "edit" && editingTemplate ? editingTemplate.name : `Untitled template ${templates.length + 1}`);
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    if (templateEditorMode === "edit" && editingTemplate) {
      setTemplates((prev) =>
        prev.map((template) => {
          if (template.id !== editingTemplateId) {
            return template;
          }
          const latestVersion = template.versions[template.versions.length - 1];
          const nextVersion = {
            ...latestVersion,
            number: latestVersion.number + 1,
            date: today
          };
          return {
            ...template,
            name: templateName,
            versions: [...template.versions, nextVersion]
          };
        })
      );
    } else {
      const newTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateName,
        type: "Subscription",
        duration: "Monthly",
        versions: [
          {
            number: 1,
            date: today,
            products: [],
            sourceSummary: "Reference price: USD 9.99 (Currency exchange rates)",
            modifierSummaries: [],
            storeCompatibilitySummaries: [],
            previewRows: makeSeededPreviewRows(9.99)
          }
        ]
      };
      setTemplates((prev) => [newTemplate, ...prev]);
    }

    goToPricingTab();
  };

  const deleteTemplate = (templateId) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId));
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="workspace">Dipsea <span>v</span></div>
        <nav className="nav">
          <a href="#">Overview</a>
          <a href="#">Charts</a>
          <a href="#">Customers</a>
          <a className="active" href="#">Product catalog</a>
          <a href="#">Paywalls</a>
          <a href="#">Targeting</a>
          <a href="#">Experiments</a>
          <a href="#">Web</a>
          <a href="#">Customer Center</a>
        </nav>
        <nav className="nav nav-group">
          <a href="#">Apps &amp; providers</a>
          <a href="#">API keys</a>
          <a href="#">Integrations</a>
          <a href="#">Project settings</a>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="search">Search...</div>
          <span>Help</span>
          <span>Account</span>
        </div>

        <div className={`content${page === "new-pricing-template" ? " content-with-footer" : ""}`}>
          {page === "catalog" ? (
            <section className="panel">
              <div className="breadcrumb">
                Dipsea / Product catalog / <span className="crumb-current">{crumbLabel}</span>
              </div>

              <div className="section">
                <h1>Product catalog</h1>

                <div className="tabs" role="tablist" aria-label="Catalog tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab${activeTab === tab.id ? " active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                    >
                      {tab.label}
                      {tab.beta ? <span className="badge">BETA</span> : null}
                    </button>
                  ))}
                </div>

                {activeTab === "offerings" ? <OfferingsView /> : null}
                {activeTab === "products" ? <ProductsView onOpenProductDetail={openProductDetail} /> : null}
                {activeTab === "pricing" ? (
                  <PricingView
                    onCreateTemplate={createTemplate}
                    onDuplicateTemplate={duplicateTemplate}
                    onOpenTemplateDetail={openTemplateDetail}
                    onDeleteTemplate={deleteTemplate}
                    templates={templates}
                  />
                ) : null}
                {activeTab === "entitlements" ? <EntitlementsView /> : null}
                {activeTab === "virtual-currencies" ? <VirtualCurrenciesView /> : null}
              </div>
            </section>
          ) : null}

          {page === "template-detail" && selectedTemplate ? (
            <TemplateDetailPage
              key={selectedTemplate.id}
              template={selectedTemplate}
              onEditTemplate={() => editTemplate(selectedTemplate.id)}
              onBackToPricing={goToPricingTab}
            />
          ) : null}

          {page === "product-detail" && selectedProduct ? (
            <ProductDetailPage
              key={selectedProduct.name}
              product={selectedProduct}
              onBackToProducts={goToProductsTab}
            />
          ) : null}

          {page === "new-pricing-template" ? (
            <NewPricingTemplatePage
              mode={templateEditorMode}
              templateName={draftTemplateName}
              onTemplateNameChange={setDraftTemplateName}
            />
          ) : null}
        </div>

        {page === "new-pricing-template" ? (
          <footer className="page-footer">
            <button className="secondary" type="button" onClick={goToPricingTab}>Cancel</button>
            <button className="primary" type="button" onClick={saveTemplate}>
              {templateEditorMode === "edit" ? "Save as new version" : "Save"}
            </button>
          </footer>
        ) : null}
      </main>
    </div>
  );
}
