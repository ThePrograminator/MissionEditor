import React from "react";
import { Form } from "react-bootstrap";
import Reader from "../Reader";

let id = 1;
const getFileId = () => `file_${(id++).toString()}`;

const Settings = (props) => {
  const handleUpload = (e) => {
    let AllFiles = [];
    [...e.target.files].map((file) => AllFiles.push(file));
    let allSeries = [];

    Reader.readAllFiles(AllFiles)
      .then((result) => {
        result.map((res) => {
          var wholeString = res.content;
          wholeString = String(wholeString);
          let regex = new RegExp("#.+\r\n", "g");
          wholeString = wholeString.replaceAll(regex, "\r\n");
          while (true) {
            var first = wholeString.indexOf("{");
            if (first === -1) break;

            //Find series
            var index = Reader.findClosingBracketIndex(wholeString, first);
            var stringArr = wholeString.substring(0, ++index);
            var seriesText = Reader.cleanUpSeries(stringArr);
            const series = Reader.handleSeries(seriesText);
            allSeries.push(series);

            //remove series from string
            wholeString = wholeString.substring(++index, wholeString.length);
            console.log("\n");
          }
        });
        console.log("allSeries", allSeries);
        let allMissions = [];
        allSeries.map((series) =>
          series.missions.map((mission, index) => {
            mission.position.x = series.slot * 150;
            if (mission.data.position !== -1)
              mission.position.y = mission.data.position * 150;
            else {
              mission.data.position = index + 1;
              mission.position.y = mission.data.position * 150;
            }
            mission.data.selectedSeries = series.id;
            allMissions.push(mission);
          })
        );
        const connections = Reader.createConnections(allMissions);
        props.setEdges(connections);
        //allMissions = allMissions.concat(connections);
        props.setSeries(allSeries);
        props.setMissions(allMissions);
        const newMissionTab = {
          id: getFileId(),
          fileName: "newFile",
          series: allSeries,
          missions: allMissions,
          edges: connections,
        };
        props.setMissionTabs([...props.missionTabs, newMissionTab]);
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <div>
      <Form>
        <Form.File
          id="custom-file"
          label="Custom file input"
          custom
          multiple
          onChange={(e) => handleUpload(e)}
        />
      </Form>
    </div>
  );
};

export default Settings;

/*for (var line = 0; line < resNew.length; line++) {
            var string = resNew[line];
            string = string.trim();
            if (string.search("^[\#]") != -1) {
              continue;
            }
            if(string.search("\#") != -1)
            {
                var stringArr = string.split("#");
                string = stringArr[0];
            }
            
            console.log(string);
          }*/

/*


          function splitSeries(str) {
  var splitCleanedUp = str.split("\n");
  let first = true;
  let newSeries = {
    id: id,
    name: "",
    slot: 0,
    generic: false,
    ai: true,
    hasCountryShield: false,
    potentialOnLoad: "",
    potential: "",
    selectedSeries: null,
    color: "",
  };
  for (var line = 0; line < splitCleanedUp.length; line++) {
    var string = splitCleanedUp[line];

    if (first) {
      var seriesName = string.split("=");

      newSeries.name = seriesName[0];
      newSeries = {
        ...newSeries,
        name: seriesName[0],
      };
      first = false;
      continue;
    }
    if (!first && string.search("=") === -1) {
      continue;
    }
    var variable = string.split("=");
    variable[0] = variable[0].trim();
    variable[1] = variable[1].trim();

    if (!first && string.search("{") === -1) {
      newSeries = {
        ...newSeries,
        [variable[0]]: variable[1],
      };
    }

    if (!first && string.search("{") != -1) {
      var stringConcat = "";
      let level = 1;
      while (true) {
        line++;
        var bracketText = splitCleanedUp[line];

        if (bracketText.search("{")) {
          level++;
        } else if (bracketText.search("}")) {
          level--;
        }

        if (level === 0) {
          break;
        } else {
          stringConcat += bracketText + "\n";
        }
      }
    }

    //console.log(seriesName);
  }
  console.log("series", newSeries);
}*/

/*

if (string.search("{") != -1 && string.search("}") != -1) {
      var inlineString = string.trim();
      var inlineString = inlineString.substring(
        inlineString.indexOf("{") + 1,
        inlineString.length - 1
      );
      inlineString = inlineString.trim();
      if (inlineString === "") {
        newMission = {
          ...newMission,
          [variable[0]]: "",
        };
        continue;
      }

      /*var newSplitString = "";

      var splitInlineString = inlineString.split(" ");

      for (var i = 0; i < splitInlineString.length; i++) {
        newSplitString += splitInlineString[i] + "\n";
      }

      newMission = {
        ...newMission,
        [variable[0]]: inlineString,
      };
      continue;
    }*/

/*
if (string.search("{") != -1) {
      //Series Bracket Variable
      if (findSeriesVariable(variable[0])) {
        var stringConcat = "";
        let level = 1;
        while (true) {
          line++;
          var bracketText = splitCleanedUp[line];

          if (bracketText.search("{") != -1) {
            level++;
          } else if (bracketText.search("}") != -1) {
            level--;
          }

          if (level === 0) {
            break;
          } else {
            stringConcat += bracketText + "\n";
          }
        }

        newSeries = {
          ...newSeries,
          [variable[0]]: stringConcat,
        };
      } else {
        let { lineStart, newMission } = splitMission(line, splitCleanedUp);
        line = lineStart;
        newSeries.missions.push(newMission);
      }
    }

    */
