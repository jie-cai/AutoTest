package com.course.testng.Threads;

import org.testng.annotations.Test;

public class ThreadsOnXML2 {
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
