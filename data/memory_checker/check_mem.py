import os

def check_memory():
    if os.path.exists('/proc/meminfo'):
        with open('/proc/meminfo', 'r') as f:
            for line in f:
                if 'MemFree' in line or 'MemAvailable' in line:
                    print(line.strip())
    else:
        print("Informações de memória não disponíveis neste sistema.")

if __name__ == '__main__':
    check_memory()
