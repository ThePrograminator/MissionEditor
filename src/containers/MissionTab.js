/*import React, { useState } from "react";
import NodeEditor from "./NodeEditor";

import { Container, Row, Tabs, Tab } from "react-bootstrap";
const MissionTab = (props) => {
  const [key, setKey] = useState("home");

  return (
    <Container fluid style={{ minHeight: "inherit" }}>
      <Tabs defaultActiveKey="missions" id="uncontrolled-tab-example">
        <Tab
          eventKey="missions"
          title="Missions"
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
        <Tab
          eventKey="addMissionFile"
          title="Add Mission"
          style={{ minHeight: "inherit" }}
        ></Tab>
      </Tabs>
    </Container>
  );
};

export default MissionTab;
*/