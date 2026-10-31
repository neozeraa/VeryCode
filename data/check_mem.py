-e import os
with open('/proc/meminfo') as f:
    print(''.join([f.readline() for _ in range(3)]))
