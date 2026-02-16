import { useMemo, useState } from "react";

const tabs = [
  { id: "offerings", label: "Offerings" },
  { id: "products", label: "Products" },
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

const entitlementsRows = [
  ["subscriptions", "Subscriptions", "48 products", "Sep 04, 2018"],
  ["gifts", "Subscription gifts redeemed", "1 product", "Oct 09, 2020"]
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

function ProductsView() {
  return (
    <div className="view active">
      <div className="headline-row">
        <p className="copy">Products are the individual in-app purchases you set up on the store platforms.</p>
        <button className="primary">New product</button>
      </div>
      <div className="search-row">Search products...</div>
      <div className="table-wrap">
        <div className="subheader">Dipsea <span className="light-actions">+ New &nbsp; Import</span></div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Entitlements</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {productsRows.map((row) => (
              <tr key={row[0]}>
                <td><a className="row-link" href="#">{row[0]}</a></td>
                <td><span className="status">Published</span></td>
                <td>1 Entitlement</td>
                <td>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

export default function App() {
  const [activeTab, setActiveTab] = useState("offerings");

  const crumbLabel = useMemo(() => {
    const found = tabs.find((tab) => tab.id === activeTab);
    return found ? found.label : "Offerings";
  }, [activeTab]);

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

        <div className="content">
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
              {activeTab === "products" ? <ProductsView /> : null}
              {activeTab === "entitlements" ? <EntitlementsView /> : null}
              {activeTab === "virtual-currencies" ? <VirtualCurrenciesView /> : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
