/* eslint-disable */
import * as Router from "expo-router";

export * from "expo-router";

declare module "expo-router" {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams:
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/smart-restock`; params?: Router.UnknownInputParams }
        | {
            pathname: `/../components/home/SectionEmptyState`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/home.utils`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/GreetingSection`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/StatsContainer`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/TransactionSection`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/Card`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}` | `/`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/inventory` | `/inventory`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sales` | `/sales`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/settings` | `/settings`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/stats` | `/stats`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/vendors` | `/vendors`;
            params?: Router.UnknownInputParams;
          };
      hrefOutputParams:
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `/smart-restock`; params?: Router.UnknownOutputParams }
        | {
            pathname: `/../components/home/SectionEmptyState`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/../components/home/home.utils`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/../components/home/GreetingSection`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/../components/home/StatsContainer`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/../components/home/TransactionSection`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/../components/home/Card`;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams }
        | {
            pathname: `${"/(tabs)"}` | `/`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/inventory` | `/inventory`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sales` | `/sales`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/settings` | `/settings`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/stats` | `/stats`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/vendors` | `/vendors`;
            params?: Router.UnknownOutputParams;
          };
      href:
        | Router.RelativePathString
        | Router.ExternalPathString
        | `/smart-restock${`?${string}` | `#${string}` | ""}`
        | `/../components/home/SectionEmptyState${`?${string}` | `#${string}` | ""}`
        | `/../components/home/home.utils${`?${string}` | `#${string}` | ""}`
        | `/../components/home/GreetingSection${`?${string}` | `#${string}` | ""}`
        | `/../components/home/StatsContainer${`?${string}` | `#${string}` | ""}`
        | `/../components/home/TransactionSection${`?${string}` | `#${string}` | ""}`
        | `/../components/home/Card${`?${string}` | `#${string}` | ""}`
        | `/_sitemap${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}${`?${string}` | `#${string}` | ""}`
        | `/${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/inventory${`?${string}` | `#${string}` | ""}`
        | `/inventory${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/sales${`?${string}` | `#${string}` | ""}`
        | `/sales${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/settings${`?${string}` | `#${string}` | ""}`
        | `/settings${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/stats${`?${string}` | `#${string}` | ""}`
        | `/stats${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/vendors${`?${string}` | `#${string}` | ""}`
        | `/vendors${`?${string}` | `#${string}` | ""}`
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/smart-restock`; params?: Router.UnknownInputParams }
        | {
            pathname: `/../components/home/SectionEmptyState`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/home.utils`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/GreetingSection`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/StatsContainer`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/TransactionSection`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/../components/home/Card`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}` | `/`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/inventory` | `/inventory`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sales` | `/sales`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/settings` | `/settings`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/stats` | `/stats`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/vendors` | `/vendors`;
            params?: Router.UnknownInputParams;
          };
    }
  }
}
