import Mailcheck from "./mailcheck.js";

if (typeof window !== "undefined" && window.jQuery) {
  (($) => {
    $.fn.mailcheck = function (opts) {
      const self = this;
      if (opts.suggested) {
        const oldSuggested = opts.suggested;
        opts.suggested = (result) => {
          oldSuggested(self, result);
        };
      }
      if (opts.empty) {
        const oldEmpty = opts.empty;
        opts.empty = () => {
          oldEmpty.call(null, self);
        };
      }
      opts.email = self.val();
      Mailcheck.run(opts);
    };
  })(window.jQuery);
}

export default Mailcheck;
