import { HomeContainer } from "@/pwa/features/home/container/home-container";
import { PageRestorer } from "@/pwa/core/components/page-restorer";

export default function Home() {
  return (
    <>
      <PageRestorer />
      <HomeContainer />
    </>
  );
}
