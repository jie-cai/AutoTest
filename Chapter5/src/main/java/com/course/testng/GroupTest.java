package com.course.testng;

import org.testng.annotations.AfterGroups;
import org.testng.annotations.BeforeGroups;
import org.testng.annotations.Test;
/*
* 方法分组测试
* */
public class GroupTest {
    @Test(groups = "server")
    public void test1() {
        System.out.println("服务端测试1111");
    }

    @Test(groups = "server")
    public void test2() {
        System.out.println("服务端测试2222");
    }

    @Test(groups = "client")
    public void test3() {
        System.out.println("客户端测试3333");
    }

    @Test(groups = "client")
    public void test4() {
        System.out.println("客户端测试4444");
    }
    @BeforeGroups(groups="server")
    public void beforeGroup(){
        System.out.println("服务端组运行之前运行的代码");
    }
    @AfterGroups(groups="server")
    public void afterGroups(){
        System.out.println("服务端组运行之后运行的代码");
    }
}
