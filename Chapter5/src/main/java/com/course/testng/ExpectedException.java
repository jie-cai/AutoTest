package com.course.testng;

import org.testng.annotations.Test;

/*
* 什么时候会用到异常测试：
* 期望结果为异常的时候，比如传入了不合法的参数，程序抛出了异常，也就是说我的预期结果就是这个异常
* */
public class ExpectedException {

    @Test(expectedExceptions = RuntimeException.class)
    public void runtimeExceptionFalied(){
        System.out.println("这是一个失败的异常测试");
    }

    @Test(expectedExceptions = RuntimeException.class)
    public void runtimeExceptionSuccess(){
        System.out.println("这是一个成功的异常测试");
        throw new RuntimeException();
    }
}
