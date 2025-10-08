from PIL import Image
# import PIL
# import glob

import os
import fnmatch

from multiprocessing import Manager, Pool, Queue, cpu_count
from typing import Tuple
TOTAL_CPUS =  cpu_count()




def WalkOnFiles(path, file_extension) :
    """
    WalkOnFiles performs the os.walk method on the directory path and returns a list of files only matching a specified file extension
    """
    corpus = [os.path.join(dirpath, f) for dirpath, dirnames, files in os.walk(path) for f in fnmatch.filter(files, f'*.{file_extension}')]
    return corpus

def converter_worker(ctx : Tuple[str,str] ):
    path, folder = ctx
    # print(f"worker of {folder} - starting it's task")

    
    relative_path = os.path.join(path,folder)
    new_path = os.path.join("public-webp", os.path.basename(relative_path))

    if not os.path.exists(new_path) :
        os.makedirs(new_path)
        
    pages_list = WalkOnFiles(relative_path, "png")
    pages_list = sorted(pages_list, reverse=True, key=lambda x: int(x[:-4].split('_')[-1]) )
    
    for page in pages_list :
        try :
            image = Image.open(page)
            image = image.convert('RGB')
            new_page = page[:-4] + ".webp"
            new_page = os.path.join(new_path, os.path.basename(new_page))
            image.save(new_page, 'webp')
        except Exception as e :
            print(f'erreur avec la page {page} : {e}')

    print(f"worker of {folder} - Completed it's task ✅")
    return

def converter_pool() :
    path = 'public-png' #os.path.join(os.getcwd(), 'public')
    # print(path)   
    folders = next(os.walk(path))[1]
    folders = sorted(folders, key=lambda x: int(x.split(' ')[1]))
    print(folders)

    

    jobs = [(path,folder) for folder in folders] #Array(iterable) of the args we are going to pass to the Pool for multiprocessing
    with Pool(TOTAL_CPUS) as pool:
        pool.map(converter_worker, jobs)
        # completed_queue.put(None)


    

# def converter() :
#     path = 'public' #os.path.join(os.getcwd(), 'public')
#     # print(path)
#     folders = next(os.walk(path))[1]
#     folders = sorted(folders, key=lambda x: int(x.split(' ')[1]))
#     print(folders)


#     for ep in folders :
#         # print(ep)
#         relative_path = os.path.join(path,ep)
#         print(relative_path)
#         new_path = os.path.basename(relative_path)
#         print(os.path.join("public-webp", new_path))
        
#         # pages_list = WalkOnFiles(relative_path, "png")
#         # pages_list = sorted(pages_list, reverse=True, key=lambda x: int(x[:-4].split('_')[-1]) )
        
#         # for page in pages_list :
#         #     image = Image.open(page)
#         #     image = image.convert('RGB')
#         #     image.save(f'{page}.webp', 'webp')
#         # return


converter_pool()



