import React from "react";

const singleVariableMapping = [
  { name: "slot", type: "int" },
  { name: "generic", type: "boolean" },
  { name: "ai", type: "boolean" },
  { name: "has_country_shield", type: "boolean" },
  { name: "icon", type: "string" },
  { name: "position", type: "int" },
  { name: "completed_by", type: "string" },
];
let seriesId = 0;
let missionId = 0;

const Reader = {
  readFileContents: async (file) => {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = reject;
      fileReader.readAsText(file);
    });
  },
  readAllFiles: async (AllFiles) => {
    const results = await Promise.all(
      AllFiles.map(async (file) => {
        const fileContents = await Reader.readFileContents(file);
        const newNode = {
          name: file.name,
          content: fileContents,
        };
        return newNode;
      })
    );
    console.log(results, "resutls");
    return results;
  },
  handleBlockBracketString: function (line, splitCleanedUp) {
    var stringConcat = "";
    var lineStart = line;
    let level = 1;
    var levelIncreased = false;
    while (true) {
      lineStart++;
      var bracketText = splitCleanedUp[lineStart];

      //inline doesn't count towards the level
      if (bracketText.search("{.+}") != -1) {
        stringConcat += bracketText + "\n";
        continue;
      } else if (bracketText.search("{") != -1) {
        levelIncreased = true;
        level++;
      } else if (bracketText.search("}") != -1) {
        level--;
      }

      if (level === 0) {
        break;
      } else {
        var tabs = "";
        if (level !== 1) {
          var startingIndex = levelIncreased ? 2 : 1;
          for (let index = startingIndex; index < level; index++) {
            tabs += "\t";
          }
          levelIncreased = false;
        }

        stringConcat += tabs + bracketText + "\n";
      }
    }

    return { lineStart, stringConcat };
  },
  handleBlockBracketArray: function (line, splitCleanedUp) {
    var arr = [];
    var lineStart = line;
    let level = 1;
    while (true) {
      lineStart++;
      var bracketText = splitCleanedUp[lineStart];
      bracketText = bracketText.trim();

      if (bracketText.search("{") != -1) {
        level++;
      } else if (bracketText.search("}") != -1) {
        level--;
      }

      if (level === 0) {
        break;
      } else {
        arr.push(bracketText);
      }
    }

    return { lineStart, arr };
  },
  handleInlineBracket: function (string) {
    var inlineString = string.trim();
    inlineString = inlineString.substring(
      inlineString.indexOf("{") + 1,
      inlineString.length - 1
    );
    inlineString = inlineString.trim();
    if (inlineString === "") return [];
    const elements = inlineString.split(" ");

    return elements;
  },
  switchVariableType: function (variable, value) {
    let type = null;
    for (let index = 0; index < singleVariableMapping.length; index++) {
      const element = singleVariableMapping[index];
      if (element.name === variable) {
        type = element.type;
        break;
      }
    }

    switch (type) {
      case "int":
        return parseInt(value);
      case "string":
        return value;
      case "boolean":
        if (value === "yes") return true;
        else return false;
      default:
        return null;
    }
  },
  findSeriesVariable: function (str) {
    if (str === "potential_on_load" || str === "potential") {
      return true;
    }
    return false;
  },
  handleMission: function (lineStart, splitCleanedUp) {
    let first = true;
    let newMission = {
      id: missionId,
      data: {
        icon: "",
        generic: false,
        position: -1,
        completed_by: "",
        required_missions: "",
        provinces_to_highlight: "",
        trigger: "",
        effect: "",
      },
      position: { x: 0, y: 0 },
    };
    for (var line = lineStart; line < splitCleanedUp.length; line++) {
      var string = splitCleanedUp[line];
      string = string.trim();
      if (!first && string === "}") {
        lineStart = line;
        break;
      }
      if (!first && string.search("=") === -1) {
        continue;
      }
      var variable = string.split("=");
      variable[0] = variable[0].trim();
      variable[1] = variable[1].trim();
      if (first) {
        newMission.data = {
          ...newMission.data,
          label: variable[0],
        };
        first = false;
        continue;
      }
      // No Bracket
      if (string.search("{") === -1) {
        newMission.data = {
          ...newMission.data,
          [variable[0]]: this.switchVariableType(variable[0], variable[1]),
        };
        continue;
      }

      //Inline Brackets
      if (string.search("{.+}") != -1) {
        newMission.data = {
          ...newMission.data,
          [variable[0]]: this.handleInlineBracket(string),
        };
        continue;
      }

      //Not inline Bracket
      if (string.search("{") != -1) {
        if (variable[0] !== "required_missions") {
          let { lineStart, stringConcat } = this.handleBlockBracketString(
            line,
            splitCleanedUp
          );
          line = lineStart;

          newMission.data = {
            ...newMission.data,
            [variable[0]]: stringConcat,
          };
        } else {
          let { lineStart, arr } = this.handleBlockBracketArray(
            line,
            splitCleanedUp
          );
          line = lineStart;

          newMission.data = {
            ...newMission.data,
            [variable[0]]: arr,
          };
        }
      }
    }
    console.log("mission", newMission);
    missionId++;
    return { lineStart, newMission };
  },
  handleSeries: function (str) {
    var splitCleanedUp = str.split("\n");
    let first = true;
    let newSeries = {
      id: seriesId,
      name: "",
      slot: 0,
      generic: false,
      ai: true,
      hasCountryShield: false,
      potentialOnLoad: "",
      potential: "",
      selectedSeries: null,
      color: "",
      missions: [],
    };
    for (var line = 0; line < splitCleanedUp.length; line++) {
      var string = splitCleanedUp[line];
      if (!first && string.search("=") === -1) {
        continue;
      }
      var variable = string.split("=");
      variable[0] = variable[0].trim();
      variable[1] = variable[1].trim();
      if (first) {
        newSeries = {
          ...newSeries,
          name: variable[0],
        };
        first = false;
        continue;
      }
      // No Bracket
      if (string.search("{") === -1) {
        newSeries = {
          ...newSeries,
          [variable[0]]: this.switchVariableType(variable[0], variable[1]),
        };
        continue;
      }

      // Bracket
      if (string.search("{") != -1) {
        //Series Bracket Variable
        if (this.findSeriesVariable(variable[0])) {
          let { lineStart, stringConcat } = this.handleBlockBracketString(
            line,
            splitCleanedUp
          );
          line = lineStart;

          newSeries = {
            ...newSeries,
            [variable[0]]: stringConcat,
          };
          continue;
        }

        let { lineStart, newMission } = this.handleMission(
          line,
          splitCleanedUp
        );
        line = lineStart;
        newSeries.missions.push(newMission);
      }
    }
    console.log("series", newSeries);
    seriesId++;
    return newSeries;
  },
  cleanUpSeries: function (str) {
    var resNew = str.split("\n");
    var cleanedUpString = "";
    //Cleanup
    for (var line = 0; line < resNew.length; line++) {
      var string = resNew[line];
      string = string.trim();
      if (string === "") {
        continue;
      }
      if (string.search("^[#]") != -1) {
        continue;
      }
      if (string.search("#") != -1) {
        var stringArr = string.split("#");
        string = stringArr[0];
      }

      cleanedUpString += string + "\n";
    }
    console.log(cleanedUpString);

    return cleanedUpString;
  },
  findClosingBracketIndex: function (str, pos) {
    let level = 1;
    for (let index = pos + 1; index < str.length; index++) {
      if (str[index] === "{") {
        level++;
      } else if (str[index] === "}") {
        level--;
      }

      if (level === 0) {
        return index;
      }
    }
    return -1;
  },
  createConnections: function (missions) {
    var mappedConnections = [];

    for (let index = 0; index < missions.length; index++) {
      const target = missions[index];
      for (let inner = 0; inner < missions.length; inner++) {
        const source = missions[inner];
        for (let l = 0; l < target.data.required_missions.length; l++) {
          const element = target.data.required_missions[l];
          if (element === source.data.label) {
            const newConnectionMap = {
              id: "e" + source.id + "-" + target.id,
              source: "node_" + source.id,
              target: "node_" + target.id,
              type: "step",
            };
            mappedConnections.push(newConnectionMap);
          }
        }
      }
    }

    console.log("mappedConnections", mappedConnections);

    return mappedConnections;

    /*missions.map((mission, index) => {
      if (mission.data.required_missions.length === 0) continue;
      const newConnectionMap = {
        from: mission.data.required_missions,
        to: mission.id,
      };
      mappedConnections.push(newConnectionMap);
    });
    return mappedConnections;*/
  },
  mapConnections: function (series, mappedConnections) {
    /*var mappedConnections = [];
    allSeries.map((series) =>
      series.missions.map((mission, index) => {
        if (mission.data.required_missions.length === 0) continue;
        const newConnectionMap = {
          from: mission.data.required_missions,
          to: mission.id,
        };
        mappedConnections.push(newConnectionMap);
      })
    );
    return mappedConnections;*/
  },
};

export default Reader;
