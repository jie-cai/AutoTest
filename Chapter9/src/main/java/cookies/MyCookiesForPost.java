package cookies;

import org.apache.http.HttpEntity;
import org.apache.http.client.CookieStore;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Locale;
import java.util.ResourceBundle;

public class MyCookiesForPost {
    private ResourceBundle bundle;
    private String uri;
    private String url;
    private String cookiesUri;
    private CookieStore cookieStore;
    @BeforeTest
    public void beforeTest(){
        bundle = ResourceBundle.getBundle("application", Locale.CHINA);
        uri = bundle.getString("test.post.with.cookies");
        url = bundle.getString("test.url");
        cookiesUri = bundle.getString("getCookies.uri");
    }

    @Test
    public void getCookies() throws IOException {
        String URL = this.url + cookiesUri;
        HttpGet get = new HttpGet(URL);
        DefaultHttpClient client = new DefaultHttpClient();
        client.execute(get);
        cookieStore = client.getCookieStore();


    }

    @Test(dependsOnMethods = "getCookies")
    public void testPostMethod() throws IOException {

        String testUrl=this.url+this.uri;
        HttpPost post = new HttpPost(testUrl);
        DefaultHttpClient client = new DefaultHttpClient();
        client.setCookieStore(this.cookieStore);

        JSONObject param = new JSONObject();
        param.put("name","huhansan");
        param.put("age","18");
        StringEntity entity = new StringEntity(param.toString());

        post.setEntity(entity);

        post.setHeader("content-type","application/json");

        CloseableHttpResponse response = client.execute(post);
        HttpEntity responseEntity = response.getEntity();
        System.out.println(responseEntity);
        String result = EntityUtils.toString(responseEntity);
        System.out.println(result);

/*        JSONObject resultJson = new JSONObject(result);
        Object name = resultJson.get("name");

        Assert.assertEquals(name,"success");*/


    }


}
