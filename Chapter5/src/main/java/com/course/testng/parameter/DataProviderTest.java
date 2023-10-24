package com.course.testng.parameter;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class DataProviderTest {

    @Test(dataProvider ="data" )
    public void Test(String name,int age){
        System.out.println("姓名："+name+";年龄："+age);
    }

    @DataProvider(name="data")
    public Object[][] dataProvider(){
        Object[][] o = new Object[][]{
                {"张三",10},
                {"李四",15},
                {"王五",18}
        };
        return o;
    }

}
