package com.course.testng.suite;

import org.testng.annotations.*;

public class SuiteConfig {
    @BeforeSuite
    public void beforeSuite(){
        System.out.println("beforeSuite执行了");
    }

    @AfterSuite
    public void afterSuite(){
        System.out.println("afterSuite执行了");
    }


    @AfterTest
    public void afterTest(){
        System.out.println("aftertest");
    }
    @BeforeTest
    public void beforeTest(){
        System.out.println("beforetest");
    }
}
