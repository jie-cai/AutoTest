package com.course.testng.Threads;

import org.testng.annotations.Test;
//多线程测试的第一种方式：通过注解实现

public class ThreadsOnAnnotation {
    @Test(invocationCount = 10)
//    invocationCount = 10 设置 调用10次
    public void test1(){
        System.out.println(1);
        System.out.println("Thread id:"+Thread.currentThread().getId());
    }


@Test(invocationCount = 10,threadPoolSize = 5)
//(invocationCount = 10,threadPoolSize = 5)
//设置调用10次，线程池中有5个线程
    public void test2(){
        System.out.println(1);
        System.out.println("Thread id:"+Thread.currentThread().getId());
    }
}
