package tech.boshkov.webdroid.server;

import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
public class ExampleUnitTest {
    @Test
    public void addition_isCorrect() throws Exception {
        assertEquals(4, 2 + 2);
    }

    @Test
    public void urlMatchTest1() throws Exception {
        String testUrl = "/rest/conversations/test-convo";
        UrlPattern pattern = new UrlPattern("/rest/conversations/{threadId}");
        UrlMatch match = pattern.match(testUrl);
        boolean matches = pattern.matches(testUrl);

        assertEquals(4, 2 + 2);
    }

}