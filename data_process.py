import json
import os
import numpy as np

np.random.seed(42)

linda = json.load(open(os.path.join('data','lindafull.json')))
bill = json.load(open(os.path.join('data','billfull.json')))

def get_list_items():
    return ["order","training 1","hobby 1","work 1","hobby 2"]

def build_tree(data,name):
    d = {}
    def update_d(d,l_k,qi,q):
        if len(l_k) == 0:
            q['info']['type'] = name
            d['question'] = q
            return
        i = l_k.pop(0)
        if i == 'order':
            key = qi[i]
        else:
            key = qi[i][0]+'-'+qi[i][1]
        try:
            d[key]
        except KeyError:
            d[key] = {}
        update_d(d[key],list(l_k),qi,q)
    for k in data:
        q = data[k]
        qi = q["info"]
        update_d(d,get_list_items(),qi,q)
    return d

COUNT = 0
def rebuild(d,l_k):
    global COUNT
    l_d = [d]
    for k in l_k:
        l_d.append(l_d[-1][k])
    l_d.reverse()
    for di in l_d:
        l_r = [k for k in di.keys() if di[k] == {}]
        for r in l_r:
            COUNT += 1
            del di[r]

def query(tree,style,order,hist,avoid):
    #print('----- query',style,order,len(hist))
    #print([str(k)[:10] for k in tree])
    if len(hist) == 5:
        out = tree['question']
        del tree['question']
        return out,hist
    elif len(hist) == 0:
        key = order
    else:
        if len(hist) == 1:
            filtered_keys = [k for k in tree.keys() if k[0] == style and not(k in avoid)]
        else:
            filtered_keys = [k for k in tree.keys() if not(k in avoid)]
        key = filtered_keys[0]#np.random.choice(filtered_keys)
    hist.append(key)
    return query(tree[key],style,order,hist,avoid)


def make_database(linda_tree,bill_tree):
    db = []
    while linda_tree != {}:
        #print('- i',i)
        avoid = []
        add = []
        for tree in [linda_tree,bill_tree]:
            for style in ['S','A']:
                for order in [0,1]:
                    #print('--- start query',style,order)
                    out,hist = query(tree,style,order,[],avoid)
                    avoid += hist[1:]
                    rebuild(tree,hist)
                    add.append(out)
                    #print(out)
                    #print(tree[hist[0]][hist[1]][hist[2]][hist[3]].keys())
                    #assert False
        np.random.shuffle(add)
        db.append(add)
    assert linda_tree ==  {}
    assert bill_tree == {}
    return db


linda_tree =  build_tree(linda,'linda')
bill_tree = build_tree(bill,'bill')

db = make_database(linda_tree,bill_tree)
print(len(db))

#Verif
#All vignettes appear exactly once in each set
for i in range(len(db)):
    d = {}
    l_i = get_list_items()[1:]
    for j in range(len(db[i])):
        for it in l_i:
            try:
                d[db[i][j]["info"][it][1]] += 1
            except KeyError:
                d[db[i][j]["info"][it][1]] = 1
    assert len(d.keys()) == 32
    for k in d:
        assert d[k] == 1

#No duplication of question
for i in range(len(db)):
    d = {}
    for j in range(len(db[i])):
        q = db[i][j]["question"]
        a = db[i][j]["answers"]
        try:
            d[q+a[0]+a[1]] += 1
        except KeyError:
            d[q+a[0]+a[1]] = 1
    for k in d:
        assert d[k] == 1
    
#Blocks each have the right composition L/B S/A O/R
for i in range(len(db)):
    d = []
    for j in range(len(db[i])):
        type_ = db[i][j]["info"]["type"]
        style = ""
        for k in get_list_items()[1:]:
            style += db[i][j]["info"][k][0]
        order = db[i][j]["info"]["order"]
        d.append((type_,style,order))
    pattern = 'SA'
    for t in ['linda','bill']:
        for s in range(2):
            if t == 'linda':
                ss = pattern[s]*2+pattern[1-s]+pattern[s]
            else:
                ss = pattern[s]*3+pattern[1-s]
            for o in range(2):
                assert (t,ss,o) in d

json.dump(db,open(os.path.join('data','db.json'),'w'))