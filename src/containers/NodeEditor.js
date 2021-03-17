import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  MiniMap,
  Background,
  isNode,
} from "react-flow-renderer";
import { Button, Form, Col } from "react-bootstrap";
//import data from "../TestData.json";

import CodeEditor from "./CodeEditor";
import "../Provider.css";

const onLoad = (reactFlowInstance) =>
  console.log("flow loaded:", reactFlowInstance);

let id = 900;
const getNodeId = () => `node_${(id++).toString()}`;
const snapGrid = [150, 150];

function applyEdgeStyle(params) {
  params.type = "step";

  params.arrowHeadType = "arrowclosed";
}

const NodeEditor = (props) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const onConnect = (params) =>
    setElements(
      (els) => (
        console.log("newConnection:", params),
        applyEdgeStyle(params),
        addEdge(params, els)
      )
    );
  useEffect(() => {
    console.log("update");
    console.log("series", props.series);
    const ele = elements.map((el) => {
      if (isNode(el) && el.data.selectedSeries != null) {
        // unfortunately we need this little hack to pass a slighltiy different position
        // in order to notify react flow about the change
        el.position = {
          x:
            props.series.find((x) => x.id === el.data.selectedSeries).slot *
            150,
          y: el.position.y,
        };
        el.style = {
          ...el.style,
          background: props.series.find((x) => x.id === el.data.selectedSeries)
            .color,
        };
      }
      return el;
    });
    setElements(ele);
  }, [props.series, selectedElement, setElements]);

  useEffect(() => {
    console.log("Elements start", elements);
    props.missions.map((mission) => {
      const newNode = {
        //id: getNodeId(),
        id: "node_" + mission.id,
        data: mission.data,
        position: mission.position,
      };
      elements.push(newNode);
    });
    props.edges.map((edge) => {
      /*const newEdge = {
        //id: getNodeId(),
        id: edge.id,
        data: mission.data,
        position: mission.position,
      };*/
      elements.push(edge);
    });

    setElements([...elements]);
    console.log("Elements End", elements);
  }, [props.missions, props.setMissions]);

  const onElementClick = (event, element) => (
    console.log("click", element), setSelectedElement(element)
  );

  const getLayoutedElements = (elements, node) => {
    return elements.map((el) => {
      if (isNode(el) && el.id === node.id) {
        // unfortunately we need this little hack to pass a slighltiy different position
        // in order to notify react flow about the change
        el.position = {
          x: el.position.x + Math.random(),
          y: node.position.y,
        };
        el.data = {
          ...el.data,
          position: node.position.y / 150,
        };
      }
      return el;
    });
  };

  const onNodeDragStop = (event, node) => {
    console.log("node", node);
    if (isNode(node) && node.data.selectedSeries != null) {
      const layoutedElements = getLayoutedElements(elements, node);
      setElements(layoutedElements);
      elements.map((el) => {
        if (isNode(el) && el.id === node.id) {
          setSelectedElement(el);
          console.log(
            "updating position for seletected element",
            selectedElement
          );
        }
      });
      console.log("elemeents", elements);
    }
  };

  const onAdd = useCallback(() => {
    console.log("Elements start", elements);
    const newNode = {
      id: getNodeId(),
      data: {
        label: "sadfasdf",
      },
      position: {
        x: 0,
        y: 0,
      },
    };
    elements.push(newNode);
    setElements([...elements]);
    console.log("Elements End", elements);
  }, [setElements]);

  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));

  return (
    <div className="providerflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper">
          <div style={{ position: "static", left: 10, top: 10, zIndex: 4 }}>
            <Form>
              <Form.Row className="align-items-center">
                <Col lg={true} style={{ maxWidth: "350px" }}>
                  <Form.Group controlId="formFileName" className="mb-2">
                    <Form.Control type="text" placeholder="Enter Mission Name" />
                  </Form.Group>
                </Col>
                <Col lg={true}>
                  <Button onClick={onAdd} className="mb-2">
                    Add Mission
                  </Button>
                </Col>
              </Form.Row>
            </Form>
          </div>
          <ReactFlow
            elements={elements}
            elementsSelectable={true}
            onElementClick={onElementClick}
            onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onPaneClick={() => setSelectedElement(null)}
            onLoad={onLoad}
            snapToGrid={true}
            snapGrid={snapGrid}
            onNodeDragStop={onNodeDragStop}
            selectNodesOnDrag={false}
            nodeExtent={[
              [150, 0],
              [750, 90000],
            ]}
            deleteKeyCode={46}
          >
            <MiniMap nodeStrokeWidth={15} style={{ borderStyle: "solid" }} />
            <Controls showInteractive={false} />
            <Background style={{ borderStyle: "solid" }} />
          </ReactFlow>
        </div>
        <CodeEditor
          missions={elements}
          setMissions={setElements}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          series={props.series}
          setSeries={props.setSeries}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default NodeEditor;
/*style={{background: "#2A353C"}}*/