import React from "react";
import { NavLink as Link } from "react-router-dom";
import "../assets/styles/Home.css"

export default function Home() {
  return (
    <div>
      <nav>
        <p>Metaverse Marketplace</p>
        <div className="nav">
          <Link to="/sellDigitalAsset" className="nav-a">Sell Digital Asset</Link>
          <Link to="/createItem" className="nav-a">Create Item</Link>
          <Link to="/myDigitalAssets" className="nav-a">My Digital Assets</Link>
          <Link to="/creatorDashboard" className="nav-a">Creator Dashboard</Link>
        </div>
      </nav>
    </div>
  );
}
