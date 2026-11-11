// Beta: tells the test checklist when the tester has changed something
// (liked, commented, posted, followed, edited profile), so it can refresh
// right away instead of waiting for its next timed check.
//
// It wraps the browser's fetch once. Every request still goes through
// unchanged; after a successful POST/PUT/PATCH/DELETE to the API, a
// "petpals:api-change" event is sent on window.

export const API_CHANGE_EVENT = "petpals:api-change";

const CHANGE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
// These don't affect the checklist (and logout leaves the page anyway)
const IGNORED_PATHS = ["/users/logout", "/users/demo", "/users/login", "/users/refresh-token"];

const installApiChangeEvents = () => {
  if (typeof window === "undefined" || !window.fetch || window.fetch.__petpalsWrapped) return;

  const originalFetch = window.fetch.bind(window);

  const wrappedFetch = async (input, init = {}) => {
    const response = await originalFetch(input, init);

    try {
      const method = (init.method || (input && input.method) || "GET").toUpperCase();
      const url = typeof input === "string" ? input : input && input.url ? input.url : String(input);
      const isApi = url.includes("/api/");
      const ignored = IGNORED_PATHS.some((path) => url.includes(path));

      if (response.ok && isApi && !ignored && CHANGE_METHODS.includes(method)) {
        window.dispatchEvent(new Event(API_CHANGE_EVENT));
      }
    } catch {
      // Never let the beta helper break a real request
    }

    return response;
  };

  wrappedFetch.__petpalsWrapped = true;
  window.fetch = wrappedFetch;
};

installApiChangeEvents();
