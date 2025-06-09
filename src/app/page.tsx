import NHLGames from "@/components/NHLGames";
import NBAGames from "@/components/NBAGames";
import MLBGames from "@/components/MLBGames";

export default function Home() {
  return (
  <div>
  The HIGH Limit Room <p />
      <div>
        {/* <NHLGames /><br /> */}
        <NBAGames /><br />
        <MLBGames /><br />
      </div>
  </div>
  );
}
