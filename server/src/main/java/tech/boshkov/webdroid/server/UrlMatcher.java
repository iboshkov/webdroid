package tech.boshkov.webdroid.server;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * UrlPattern leverages Regex Pattern to represent a parameterized URL. Parameters within the URL are
 * denoted by curly braces '{}' with the parameter name contained within (e.g. '{userid}').
 *
 * <p/>Parameter names must be formed of word characters (e.g. A-Z, a-z, 0-9, '_').
 * <p/>An optional format parameter following a dot ('.') may be added to the end.  While it could be named any valid parameter name,
 * RestExpress offers special handling (e.g. within the Request, etc.) if it's named 'format'.
 * <p/>
 * Note that the format specifier allows only word characters and percent-encoded characters.
 *
 * <p/>URL Pattern examples:
 * <ul>
 *   <li>/api/search.{format}</li>
 *   <li>/api/search/users/{userid}.{format}</li>
 *   <li>/api/{version}/search/users/{userid}</li>
 * </ul>
 *
 * RestExpress parses URI paths which is described in the URI Generic Syntax IETF RFC 3986 specifcation,
 * section 3.3 (http://tools.ietf.org/html/rfc3986#section-3.3). RestExpress parses paths into segments
 * separated by slashes ("/"), the segments of which are composed of unreserved, percent encoded,
 * sub-delimiters, colon (":") or asperand ("@"), each of which are defined below (from the spec):
 * <p/>
 * pct-encoded   = "%" HEXDIG HEXDIG
 * <p/>
 * unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"<br/>
 * reserved      = gen-delims / sub-delims<br/>
 * gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"</br>
 * sub-delims    = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "=" *
 * <p/>
 * In other words, RestExpress accepts path segments containing: [A-Z] [a-z] [0-9] % - . _ ~ ! $ & ' ( ) * + , ; = : @
 * <p/>
 * RestExpress also accepts square brackets ('[' and ']'), but this is deprecated and not recommended.
 *
 * @author toddf
 * @since Apr 28, 2010
 * @see http://www.ietf.org/rfc/rfc3986.txt
 */

public interface UrlMatcher
{
    public boolean matches(String url);
    public UrlMatch match(String url);
    public String getPattern();
    public List<String> getParameterNames();
}

