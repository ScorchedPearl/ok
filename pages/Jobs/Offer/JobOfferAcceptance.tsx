"use client";

import { useParams } from "react-router-dom";
import OffersPage from "./OffersPage";
import OfferDetailPage from "./OffersPage";

export default function JobOfferAcceptance() {
  const { id } = useParams();

  // If an :id exists in the URL, render the detail page.
  // Otherwise, render the list page.

  console.log("id",id);

  return id ? <OffersPage /> : <OfferDetailPage />;
}
