import { Command, flags } from "@oclif/command";
import * as ax from "axios";
const axios = ax.default;

interface AzureBuildDefinition {
  name: string;
  id: number;
  url: string;
  revision: number;
}

interface AzureListApiResponse<T> {
  value: T[];
  count: number;
}

export default class Run extends Command {
  static description = "trigger an azure pipeline and wait for it to finish";

  static examples = [
    `$ azure-pipelines run some-pipeline-id personal-access-token
hello world from ./src/hello.ts!
`
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    // flag for definitions to run (-d, --definitions=VALUE)
    definitions: flags.integer({
      char: "d",
      description:
        "build definitions to run. All will be ran if nothing is provided",
      multiple: true
    })
  };

  static args = [
    { name: "organization", required: true },
    { name: "project", required: true },
    { name: "personalAccessToken", required: true },
    { name: "definitions" }
  ];

  async run() {
    const { args, flags } = this.parse(Run);

    try {
      const { organization, project, personalAccessToken } = args;

      const headers = {
        headers: {
          Authorization: `Basic ${this.toB64(`${personalAccessToken}:`)}`
        }
      };

      const requestUrl = (endpoint: string) =>
        `https://dev.azure.com/${organization}/${project}/_apis/build/${endpoint}?api-version=5.0`;

      const { value: definitions } = await (
        await axios.get<AzureListApiResponse<AzureBuildDefinition>>(
          requestUrl("definitions"),
          headers
        )
      ).data;

      let buildDefinitionIdsToTrigger = [...definitions.map(x => x.id)];
      if (flags.definitions) {
        buildDefinitionIdsToTrigger = flags.definitions.filter(d => {
          const index = buildDefinitionIdsToTrigger.findIndex(i => i === d);
          if (index === -1) {
            this.log(
              `Build definition with id ${d} was provided, but does not exist in the current build definitions for this project. Skipping...`
            );

            return false;
          }

          return true;
        });
      }

      if (buildDefinitionIdsToTrigger.length === 0) {
        return this.error(
          `No build definition was is selected for queuing. Aborting...`,
          { exit: -1 }
        );
      }

      this.log(buildDefinitionIdsToTrigger);

      // const response = await axios.post(requestUrl, {});

      // this.log(`Response: ${JSON.stringify(response)}`);
    } catch (error) {
      return this.error(error);
    }
  }

  private toB64(input: string): string {
    const buff = Buffer.from(input);
    return buff.toString("base64");
  }
}
