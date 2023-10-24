package com.course.testng;

import org.testng.annotations.*;

public class AnnotationTest {

    @Test
    public void caseTest1(){
        System.out.println("测试用例1");
    }

    @Test
    public void caseTest2(){
        System.out.println("测试用例2");
    }


    @BeforeClass
    //类之前运行
    public void beforeClass(){
        System.out.println("测试用例执行前执行的代码");
    }
    //类之后运行
    @AfterClass
    public void afterClass(){
        System.out.println("测试用例执行后执行的代码");
    }

    @BeforeMethod
    //方法之前运行的
    public void beforeMethod(){
        System.out.println("方法执行前执行的代码");
    }

    @AfterMethod
    //方法之后运行
    public void afterMethod(){
        System.out.println("方法执行后执行的代码");
    }

    @BeforeSuite
    // 类运行之前运行的
    public void beforeSuite(){
        System.out.println("测试套件");
    }

    @AfterSuite
    public void afterSuite(){
        System.out.println("测试套件");
    }


}
