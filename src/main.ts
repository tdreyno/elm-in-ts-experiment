import fetchPonyfill from "fetch-ponyfill";
import unionize, { ofType } from "unionize";
import { effect, log, NONE, t } from "./lib";

const { fetch } = fetchPonyfill();

export const Model = unionize({
  Initializing: {},
  Loading: {},
  Ready: ofType<{ message: string }>(),
});

export const Action = unionize({
  StartLoading: ofType<{ url: string }>(),
  FinishedLoading: ofType<{ result: string }>(),
  Reset: {},
});

const loadData = effect((url: string) =>
  fetch(url)
    .then(response => response.text())
    .then(result => Action.FinishedLoading({ result })),
);

export const init = () => Model.Initializing();

export const update = Action.match({
  StartLoading: ({ url }) =>
    Model.match({
      Initializing: () => t(Model.Loading(), loadData(url)),
      default: model => t(model, NONE),
    }),

  FinishedLoading: ({ result }) =>
    Model.match({
      Loading: () =>
        t(
          Model.Ready({ message: result }),
          log(`Got result: ${result.length}`),
        ),
      default: model => t(model, NONE),
    }),

  Reset: () =>
    Model.match({
      Ready: () => t(Model.Initializing(), NONE),
      default: model => t(model, NONE),
    }),
});
