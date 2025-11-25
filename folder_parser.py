import json
import os
import fnmatch

def WalkOnFiles(path, file_extension) :
    """
    WalkOnFiles performs the os.walk method on the directory path and returns a list of files only matching a specified file extension
    """
    corpus = [os.path.join(dirpath, f) for dirpath, dirnames, files in os.walk(path) for f in fnmatch.filter(files, f'*.{file_extension}')]
    return corpus

def parser(public_file, extension) :
    path = public_file
    # print(path)
    folders = next(os.walk(path))[1]
    folders = sorted(folders, key=lambda x: int(x.split(' ')[1]))
    print(folders)
    # return
    # data = []

    data_bis = {}

    for ep in folders :
        name = ep
        relative_path = os.path.join(path,ep)
        pages_list = WalkOnFiles(relative_path, extension)
        pages_list = ["/raconte_le_site/" + x for x in pages_list]
        # print(pages_list)
        # return
        # if extension == "png" :
        #     pages_list = sorted(pages_list, reverse=True, key=lambda x: int(x[:-4].split('_')[-1]) )
        print(pages_list)
        # return
        if extension == "webp" :
            pages_list = sorted(pages_list, reverse=True, key=lambda x: int(x[:-5].split('_')[-1]) )

        
        # data.append({"name" : name,
        #             "path" : relative_path,
        #             "page_list" : pages_list})

        data_bis.update({name : ["/raconte_le_site/" + relative_path,pages_list]})


    # json_res = json.dumps(data, indent=4)
    json_res = json.dumps(data_bis, indent=4)

    with open(f"{public_file}/episodes_list.json", "w", encoding = "utf-8") as f :
        f.write(json_res)

    
    print("✅ episodes_list.json généré !")


# parser("public-png", "png")
parser("public-webp", "webp")
