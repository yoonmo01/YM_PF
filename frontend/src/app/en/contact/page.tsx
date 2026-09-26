import type { Metadata } from "next";
import { ContactContent } from "../../contact/page";

export const metadata: Metadata = { title: "Contact", description: "Contact Yoonmo Yang about projects and collaboration." };

export default function EnglishContactPage() { return <ContactContent locale="en" />; }
