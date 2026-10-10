import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Page = () => {
  redirect("/dashboard/live");
};

export default Page;

