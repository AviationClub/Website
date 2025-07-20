import Events from "@/components/events";
import LoadingManager from "@/components/loading-manager";
import { MIN_LOAD_TIME_PAGES } from "@/utils/constants";
import React from "react";

const EventsPage = () => {
  return (
    <LoadingManager minLoadTime={MIN_LOAD_TIME_PAGES}>
      <main>
        <Events />
      </main>
    </LoadingManager>
  );
};

export default EventsPage;
