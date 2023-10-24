package com.course.testng;

import org.testng.annotations.Test;

public class DependsTest {
    @Test
    public void test1(){
        System.out.println("test1");
    }

    @Test(dependsOnMethods = "test1")
    public void test2(){
        System.out.println("test2");

    }
    @Test
    public void test4(){
        System.out.println("test4");
        throw new RuntimeException();
    }

    @Test(dependsOnMethods = "test4")
    public void test3(){
        System.out.println("test3");
    }
}
