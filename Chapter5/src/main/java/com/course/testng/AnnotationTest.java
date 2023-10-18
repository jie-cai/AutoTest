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
    public void beforeClass(){
        System.out.println("测试用例执行前执行的代码");
    }

    @AfterClass
    public void afterClass(){
        System.out.println("测试用例执行后执行的代码");
    }

    @BeforeMethod
    public void beforeMethod(){
        System.out.println("方法执行前执行的代码");
    }

    @AfterMethod
    public void afterMethod(){
        System.out.println("方法执行后执行的代码");
    }



}
