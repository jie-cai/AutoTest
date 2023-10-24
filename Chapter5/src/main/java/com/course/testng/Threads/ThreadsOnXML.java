package com.course.testng.Threads;
//多线程的第二种方式：通过配置文件XML

import org.testng.annotations.Test;

public class ThreadsOnXML {
    @Test
    public void test1(){
        System.out.println("Thread id:"+Thread.currentThread().getId());
    }
    @Test
    public void test2(){
        System.out.println("Thread id:"+Thread.currentThread().getId());
    }
    @Test
    public void test3(){
        System.out.println("Thread id:"+Thread.currentThread().getId());
    }
}
