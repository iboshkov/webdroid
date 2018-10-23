package tech.boshkov.webdroid.server;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class UrlMatch
{
    /**
     * Parameter values parsed from the URL during the match.
     */
    private Map<String, String> parameters = new HashMap<String, String>();


    // SECTION: CONSTRUCTOR

    public UrlMatch(Map<String, String> parameters)
    {
        super();

        if (parameters != null)
        {
            this.parameters.putAll(parameters);
        }
    }


    // SECTION: ACCESSORS

    /**
     * Retrieves a parameter value parsed from the URL during the match.
     *
     * @param name the name of a parameter for which to retrieve the value.
     * @return the parameter value from the URL, or null if not present.
     */
    public String get(String name)
    {
        return parameters.get(name);
    }

    /**
     * Retrieves the parameter entries as a set.
     *
     * @return a Set of Map entries (by String, String).
     */
    public Set<Map.Entry<String, String>> parameterSet()
    {
        return Collections.unmodifiableSet(parameters.entrySet());
    }
}
