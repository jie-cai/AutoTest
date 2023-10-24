package src.main.java.com.tester.extentReport;

import org.testng.Assert;
import org.testng.Reporter;
import org.testng.annotations.Test;
/*
* 断言和添加日志
* */
public class ReportLogTest {
    @Test
    public void test1(){
        Assert.assertEquals(1,2);
    }
    @Test
    public void test2(){
        Assert.assertEquals(1,1);
    }
    @Test
    public void test3(){
        Assert.assertEquals(1,"1");
    }
    @Test
    public void testA(){
        Reporter.log("这是我们写的日志");
        throw new RuntimeException("这是我自己添加的异常");
    }
}
