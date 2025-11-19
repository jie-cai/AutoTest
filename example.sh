#!/bin/bash

# 示例Shell脚本
# 这是一个简单的Shell脚本示例，展示了基本的Shell编程概念

echo "欢迎使用Shell脚本示例！"

# 变量定义
NAME="用户"
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")
WORKING_DIR=$(pwd)

echo "当前时间: $CURRENT_DATE"
echo "工作目录: $WORKING_DIR"

# 函数定义
greet_user() {
    local user_name=$1
    echo "你好，$user_name！"
}

# 调用函数
greet_user "$NAME"

# 条件判断
if [ -d "Chapter5" ]; then
    echo "发现Chapter5目录"
else
    echo "未找到Chapter5目录"
fi

# 循环示例
echo "当前目录下的文件和文件夹："
for item in *; do
    if [ -f "$item" ]; then
        echo "  文件: $item"
    elif [ -d "$item" ]; then
        echo "  目录: $item"
    fi
done

# 数字计算
echo "简单的数学计算："
NUM1=10
NUM2=5
echo "$NUM1 + $NUM2 = $((NUM1 + NUM2))"
echo "$NUM1 * $NUM2 = $((NUM1 * NUM2))"

# 文件操作检查
echo "检查文件是否存在："
if [ -f "pom.xml" ]; then
    echo "pom.xml文件存在"
    echo "文件大小: $(stat -c%s "pom.xml") 字节"
else
    echo "pom.xml文件不存在"
fi

echo "脚本执行完成！"