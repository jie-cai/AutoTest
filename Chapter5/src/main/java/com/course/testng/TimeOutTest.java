package com.course.testng;

import org.testng.annotations.Test;

public class TimeOutTest {

    @Test(timeOut = 3000)
    public void TimeOutTestS() throws InterruptedException {
        Thread.sleep(2000);
    }

    @Test(timeOut = 2000)
    public void TimeOutTestF() throws InterruptedException {
        Thread.sleep(3000);
    }
}
