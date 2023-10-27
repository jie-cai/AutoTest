package cookies;

import org.apache.http.HttpEntity;
import org.apache.http.client.CookieStore;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

public class MyCookiesForGet {
    private ResourceBundle bundle;
    private String url;
    private String getCookiesUri;
    private CookieStore cookieStore;
    private String getUri;
    @BeforeTest
    public void beforeTest(){
        bundle = ResourceBundle.getBundle("application", Locale.CANADA);
        url = bundle.getString("test.url");
        getCookiesUri = bundle.getString("getCookies.uri");
        getUri = bundle.getString("test.get.with.cookies");

    }
    @Test
    public void getCookies() throws IOException {
        String testUrl=this.url+this.getCookiesUri;
        HttpGet get = new HttpGet(testUrl);
        DefaultHttpClient client = new DefaultHttpClient();
        CloseableHttpResponse response = client.execute(get);
        HttpEntity entity = response.getEntity();
        String result = EntityUtils.toString(entity,"utf-8");
        System.out.println(result);

        cookieStore = client.getCookieStore();
        List<Cookie> cookieList = cookieStore.getCookies();
        for (Cookie cookie:cookieList){
            System.out.println(cookie.getName()+"="+cookie.getValue());
        }
    }
    @Test(dependsOnMethods = "getCookies")
    public void getWithCookies() throws IOException {
        String testUrl = this.url + this.getUri;
        HttpGet get = new HttpGet(testUrl);
        DefaultHttpClient client = new DefaultHttpClient();
        client.setCookieStore(this.cookieStore);

        CloseableHttpResponse response = client.execute(get);
        int statusCode = response.getStatusLine().getStatusCode();
        System.out.println("statusCode:"+statusCode);

        if(statusCode==200){
            String result = EntityUtils.toString(response.getEntity());
            System.out.println(result);
        }


    }

}
