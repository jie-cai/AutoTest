package com.course.testng.Threads;

import org.testng.annotations.Test;

public class ThreadsOnXML3 {
    @Test
    public void test1(){
        System.out.println("Thread id:"+Thread.currentThread().getId());
    }

}
