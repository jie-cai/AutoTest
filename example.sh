#!/bin/bash

# Shell脚本示例 - 系统信息收集工具
# 作者: iFlow CLI
# 日期: 2025-11-19

# 设置错误处理
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数：检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 函数：获取系统信息
get_system_info() {
    print_info "正在收集系统信息..."
    
    echo "========================================="
    echo "系统信息报告"
    echo "生成时间: $(date)"
    echo "========================================="
    echo
    
    # 操作系统信息
    echo "操作系统信息:"
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "  发行版: $NAME"
        echo "  版本: $VERSION"
        echo "  ID: $ID"
    else
        echo "  无法获取操作系统信息"
    fi
    echo
    
    # 内核信息
    echo "内核信息:"
    echo "  版本: $(uname -r)"
    echo "  架构: $(uname -m)"
    echo "  主机名: $(hostname)"
    echo
    
    # CPU信息
    echo "CPU信息:"
    if command_exists lscpu; then
        echo "  型号: $(lscpu | grep 'Model name' | cut -d: -f2 | xargs)"
        echo "  核心数: $(nproc)"
        echo "  线程数: $(lscpu | grep '^CPU(s):' | cut -d: -f2 | xargs)"
    else
        echo "  lscpu命令不可用"
    fi
    echo
    
    # 内存信息
    echo "内存信息:"
    if command_exists free; then
        total_mem=$(free -h | grep '^Mem:' | awk '{print $2}')
        used_mem=$(free -h | grep '^Mem:' | awk '{print $3}')
        available_mem=$(free -h | grep '^Mem:' | awk '{print $7}')
        echo "  总内存: $total_mem"
        echo "  已使用: $used_mem"
        echo "  可用: $available_mem"
    else
        echo "  free命令不可用"
    fi
    echo
    
    # 磁盘信息
    echo "磁盘信息:"
    if command_exists df; then
        echo "  磁盘使用情况:"
        df -h | grep -E '^/dev/' | while read line; do
            echo "    $line"
        done
    fi
    echo
    
    # 网络信息
    echo "网络信息:"
    if command_exists ip; then
        echo "  IP地址:"
        ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print "    " $2}' | cut -d/ -f1
    elif command_exists ifconfig; then
        echo "  IP地址:"
        ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print "    " $2}'
    fi
    echo
    
    # 进程信息
    echo "进程信息:"
    echo "  总进程数: $(ps aux | wc -l)"
    echo "  运行中的进程: $(ps aux | grep -c 'R')"
    echo "  睡眠中的进程: $(ps aux | grep -c 'S')"
    echo
    
    # 用户信息
    echo "用户信息:"
    echo "  当前用户: $(whoami)"
    echo "  登录用户:"
    who | awk '{print "    " $1 " (" $3 " " $4 ")"}'
    echo
    
    # 系统负载
    echo "系统负载:"
    uptime | awk '{print "  " $0}'
    echo
    
    # 环境变量
    echo "重要环境变量:"
    echo "  HOME: $HOME"
    echo "  PATH: $PATH"
    echo "  SHELL: $SHELL"
    echo "  LANG: ${LANG:-未设置}"
    echo
    
    print_success "系统信息收集完成！"
}

# 函数：创建备份
create_backup() {
    local backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    print_info "正在创建备份目录: $backup_dir"
    
    mkdir -p "$backup_dir"
    
    # 备份重要配置文件
    if [ -f /etc/hosts ]; then
        cp /etc/hosts "$backup_dir/"
        print_success "已备份 /etc/hosts"
    fi
    
    if [ -f ~/.bashrc ]; then
        cp ~/.bashrc "$backup_dir/"
        print_success "已备份 ~/.bashrc"
    fi
    
    if [ -f ~/.profile ]; then
        cp ~/.profile "$backup_dir/"
        print_success "已备份 ~/.profile"
    fi
    
    print_success "备份完成，保存在: $backup_dir"
}

# 函数：清理系统垃圾
cleanup_system() {
    print_info "正在清理系统垃圾文件..."
    
    # 清理临时文件
    if [ -d /tmp ]; then
        old_tmp_files=$(find /tmp -type f -mtime +7 2>/dev/null | wc -l)
        if [ "$old_tmp_files" -gt 0 ]; then
            print_warning "发现 $old_tmp_files 个超过7天的临时文件"
            read -p "是否删除这些文件？(y/N): " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                find /tmp -type f -mtime +7 -delete 2>/dev/null
                print_success "已清理临时文件"
            fi
        fi
    fi
    
    # 清理包管理器缓存
    if command_exists apt-get; then
        print_info "清理APT缓存..."
        sudo apt-get autoremove -y >/dev/null 2>&1
        sudo apt-get autoclean >/dev/null 2>&1
        print_success "APT缓存清理完成"
    elif command_exists yum; then
        print_info "清理YUM缓存..."
        sudo yum autoremove -y >/dev/null 2>&1
        sudo yum clean all >/dev/null 2>&1
        print_success "YUM缓存清理完成"
    fi
    
    print_success "系统清理完成！"
}

# 主函数
main() {
    echo "========================================="
    echo "Shell脚本示例工具"
    echo "========================================="
    echo
    echo "可用选项:"
    echo "  1) 显示系统信息"
    echo "  2) 创建备份"
    echo "  3) 清理系统垃圾"
    echo "  4) 执行所有操作"
    echo "  5) 退出"
    echo
    
    read -p "请选择操作 (1-5): " choice
    
    case $choice in
        1)
            get_system_info
            ;;
        2)
            create_backup
            ;;
        3)
            cleanup_system
            ;;
        4)
            get_system_info
            create_backup
            cleanup_system
            ;;
        5)
            print_info "感谢使用，再见！"
            exit 0
            ;;
        *)
            print_error "无效选择，请输入1-5之间的数字"
            exit 1
            ;;
    esac
}

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
    print_warning "建议以root权限运行此脚本以获得完整功能"
fi

# 检查参数
if [ $# -eq 0 ]; then
    main
else
    case $1 in
        --info|-i)
            get_system_info
            ;;
        --backup|-b)
            create_backup
            ;;
        --cleanup|-c)
            cleanup_system
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo
            echo "选项:"
            echo "  -i, --info     显示系统信息"
            echo "  -b, --backup   创建备份"
            echo "  -c, --cleanup  清理系统垃圾"
            echo "  -h, --help     显示帮助信息"
            echo
            echo "无参数时进入交互模式"
            ;;
        *)
            print_error "未知参数: $1"
            echo "使用 --help 查看可用选项"
            exit 1
            ;;
    esac
fi