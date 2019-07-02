import { run } from "./lib";
import { Action, init, update } from "./main";

// Until we can run await at the root
(async () => {
  let currentModel = init();

  currentModel = await run(
    update,
    currentModel,
    Action.StartLoading({ url: "https://google.com" }),
  );

  // tslint:disable-next-line:no-console
  console.log(currentModel.tag);
})();
