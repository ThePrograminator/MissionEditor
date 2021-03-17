import React, { useState } from "react";
import NodeEditor from "./NodeEditor";
import TabHeader from "../components/TabHeader";
import { Container, Row, Tabs, Tab, ButtonGroup, Button } from "react-bootstrap";

import '../tabs.css'

const MissionList = (props) => {
  const [key, setKey] = useState("home");

  const handleCreateMissionFile = () => {
    console.log("Added Mission");
  };

  const handleRemoveMissionFile = () => {
    console.log("Removed Mission");
  };

  return (
    <Container fluid style={{ minHeight: "inherit" }}>
      <ButtonGroup size="lg" className="mb-2">
        <Button onClick={handleCreateMissionFile}>Create Mission File</Button>
        <Button onClick={handleCreateMissionFile}>Remove Mission File</Button>
      </ButtonGroup>
      <Tabs defaultActiveKey="createMissionFile" id="uncontrolled-tab-example">
        {props.missionTabs.length > 0
          ? props.missionTabs.map((missionTab) => {
              return (
                <Tab
                  key={missionTab.fileName}
                  eventKey={"missionTab_" + missionTab.id}
                  title={missionTab.fileName}
                  style={{ minHeight: "inherit" }}
                >
                  <Container fluid style={{ minHeight: "90vh" }}>
                    <Row style={{ minHeight: "90vh" }}>
                      <NodeEditor
                        missions={props.missions}
                        setMissions={props.setMissions}
                        series={props.series}
                        setSeries={props.setSeries}
                        edges={props.edges}
                      />
                    </Row>
                  </Container>
                </Tab>
              );
            })
          : null}
      </Tabs>
    </Container>
  );
};

export default MissionList;
