import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.http.HttpClient;

public class MyHttpClient {
    @Test
    public void test1() throws IOException {

        HttpGet get = new HttpGet("http://www.baidu.com");
        DefaultHttpClient defaultHttpClient = new DefaultHttpClient();
        CloseableHttpResponse response = defaultHttpClient.execute(get);
        HttpEntity entity = response.getEntity();
        String result = EntityUtils.toString(entity);
        System.out.println(result);
    }
}
