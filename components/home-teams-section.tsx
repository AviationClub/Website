import React from "react";
import Team from "./home-team";
import { TEAMS } from "@/utils/constants";

const HomeTeamsSection = () => {
  return (
    <section className="flex flex-col items-center">
      {TEAMS.map((team) => (
        <Team
          key={team.title}
          reversed={team.reversed}
          speed={team.speed}
          teamTitle={team.title}
          teamImgSrc={team.imgSrc}
        />
      ))}
    </section>
  );
};

export default HomeTeamsSection;
