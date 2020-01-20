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

interface AzureBuild {
  id: number;
  buildNumber: string;
  status:
    | "all"
    | "cancelling"
    | "completed"
    | "inProgress"
    | "none"
    | "notStarted"
    | "postponed";
  result: "canceled" | "failed" | "none" | "partiallySucceeded" | "succeeded";
  queueTime: number; // timestamp
  definition: AzureBuildDefinition;
}

export default class Run extends Command {
  static description =
    "trigger one or more azure pipelines and wait for them to finish";

  static examples = [
    `$ azure-pipelines run myOrganization myProject master personalAccessToken
Queuing build with definition id "2"...
Queuing build with definition id "3"...
Queuing build with definition id "4"...
Queued build "Desktop CI (WPF)" (build id = 27). Waiting for it to finish... (polling)
Queued build "Android-CI" (build id = 28). Waiting for it to finish... (polling)
Queued build "Server CI (.NET Core)" (build id = 26). Waiting for it to finish... (polling)
Got refreshed build status for Desktop CI (WPF). CurrentStatus: inProgress
Got refreshed build status for Desktop CI (WPF). CurrentStatus: completed
Build finished with result "succeeded"
Got refreshed build status for Server CI (.NET Core). CurrentStatus: inProgress
Got refreshed build status for Server CI (.NET Core). CurrentStatus: completed
Build finished with result "failed"
Got refreshed build status for Android-CI. CurrentStatus: inProgress
Got refreshed build status for Android-CI. CurrentStatus: completed
Build finished with result "failed"
`
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    // flag for definitions to run (-d, --definitions=VALUE)
    definitions: flags.integer({
      char: "d",
      description:
        "build definition IDs to run as an array of integer. All available pipelines will be ran if nothing is provided",
      multiple: true
    })
  };

  static args = [
    { name: "organization", required: true },
    { name: "project", required: true },
    { name: "sourceBranch", required: true },
    { name: "personalAccessToken", required: true },
    { name: "definitions" }
  ];

  private authHeaders: any;

  async run() {
    const { args, flags } = this.parse(Run);

    try {
      const { organization, project, personalAccessToken, sourceBranch } = args;
      this.requestUrl = (endpoint: string) =>
        `https://dev.azure.com/${organization}/${project}/_apis/build/${endpoint}?api-version=5.0`;
      this.authHeaders = {
        headers: {
          Authorization: `Basic ${this.toB64(`${personalAccessToken}:`)}`
        }
      };

      const { value: definitions } = await (
        await axios.get<AzureListApiResponse<AzureBuildDefinition>>(
          this.requestUrl("definitions"),
          this.authHeaders
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

      const all = await Promise.all(
        buildDefinitionIdsToTrigger.map((id: number) =>
          this.queueBuild(id, sourceBranch)
        )
      );

      return this.exit(all.every(x => x) ? 0 : -1);
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

  private requestUrl!: (endpoint: string) => string;

  private async queueBuild(id: number, sourceBranch: string): Promise<boolean> {
    return new Promise(async resolve => {
      this.log(`Queuing build with definition id "${id}"...`);
      const build = (
        await axios.post<AzureBuild>(
          this.requestUrl("builds"),
          {
            definition: { id },
            sourceBranch
          },
          this.authHeaders
        )
      ).data;
      this.log(
        `Queued build "${build.definition.name}" (build id = ${build.id}). Waiting for it to finish... (polling)`
      );

      let currentStatus = build.status;
      const polling = async () => {
        const refreshedBuild = (
          await axios.get<AzureBuild>(
            this.requestUrl(`builds/${build.id}`),
            this.authHeaders
          )
        ).data;

        if (currentStatus !== refreshedBuild.status) {
          this.log(
            `Got refreshed build status for ${refreshedBuild.definition.name}. CurrentStatus: ${refreshedBuild.status}`
          );
        }

        currentStatus = refreshedBuild.status;
        if (refreshedBuild.status === "completed") {
          this.log(`Build finished with result "${refreshedBuild.result}"`);
          return resolve(refreshedBuild.result === "succeeded");
        }

        setTimeout(polling, 500);
      };

      polling();
      // Wait until the build is completed
    });
  }
}
