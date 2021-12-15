// based on https://www.npmjs.com/package/glob-to-regexp

/* eslint-disable */

export const globToRegExp = (glob: string): RegExp => {
  const str = String(glob);

  // The regexp we are building, as a string.
  let reStr = '';

  // Whether we are matching so called "extended" globs (like bash) and should
  // support single character matching, matching ranges of characters, group
  // matching, etc.
  const extended = false;

  // When globstar is _false_ (default), '/foo/*' is translated a regexp like
  // '^\/foo\/.*$' which will match any string beginning with '/foo/'
  // When globstar is _true_, '/foo/*' is translated to regexp like
  // '^\/foo\/[^/]*$' which will match any string beginning with '/foo/' BUT
  // which does not have a '/' to the right of it.
  // E.g. with '/foo/*' these will match: '/foo/bar', '/foo/bar.txt' but
  // these will not '/foo/bar/baz', '/foo/bar/baz.txt'
  // Lastely, when globstar is _true_, '/foo/**' is equivelant to '/foo/*' when
  // globstar is _false_
  const globstar = true;

  // If we are doing extended matching, this boolean is true when we are inside
  // a group (eg {*.html,*.js}), and false otherwise.
  let inGroup = false;

  // RegExp flags (eg "i" ) to pass in to RegExp constructor.
  const flags = '';

  let c;

  for (let i = 0, len = str.length; i < len; i++) {
    c = str[i];

    // @ts-ignore
    // @ts-ignore
    switch (c) {
      case '/':
      case '$':
      case '^':
      case '+':
      case '.':
      case '(':
      case ')':
      case '=':
      case '!':
      case '|':
        reStr += '\\' + c;
        break;
      // @ts-ignore
      case '?':
        if (extended) {
          reStr += '.';
          break;
        }

      case '[':

      // @ts-ignore
      case ']':
        if (extended) {
          reStr += c;
          break;
        }

      // @ts-ignore
      case '{':
        if (extended) {
          inGroup = true;
          reStr += '(';
          break;
        }

      // @ts-ignore
      case '}':
        if (extended) {
          inGroup = false;
          reStr += ')';
          break;
        }

      case ',':
        if (inGroup) {
          reStr += '|';
          break;
        }

        reStr += '\\' + c;
        break;

      case '*':
        // Move over all consecutive "*"'s.
        // Also store the previous and next characters
        var prevChar = str[i - 1];
        var starCount = 1;

        while (str[i + 1] === '*') {
          starCount++;
          i++;
        }

        var nextChar = str[i + 1];

        if (!globstar) {
          // globstar is disabled, so treat any number of "*" as one
          reStr += '.*';
        } else {
          // globstar is enabled, so determine if this is a globstar segment
          const isGlobstar =
            starCount > 1 && // multiple "*"'s
            (prevChar === '/' || prevChar === undefined) && // from the start of the segment
            (nextChar === '/' || nextChar === undefined); // to the end of the segment

          if (isGlobstar) {
            // it's a globstar, so match zero or more path segments
            reStr += '((?:[^/]*(?:/|$))*)';
            i++; // move over the "/"
          } else {
            // it's not a globstar, so only match one path segment
            reStr += '([^/]*)';
          }
        }

        break;

      default:
        reStr += c;
    }
  }

  reStr = '^' + reStr; //  + "$";

  return new RegExp(reStr, flags);
};
